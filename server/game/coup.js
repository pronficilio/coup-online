const gameUtils = require('./utils')
const constants = require('../utilities/constants')
const crypto = require('node:crypto')
const { RULESET_VERSION, projectPublicEvent } = require('../ai/codex-protocol')
const { actionLabel } = require('../i18n')

const EFFORTS = new Set(['low', 'medium', 'high'])
const ACTION_COSTS = { coup: 7, assassinate: 3 }

const ROLE_BY_ACTION = {
    tax: constants.CardNames.DUKE,
    assassinate: constants.CardNames.ASSASSIN,
    exchange: constants.CardNames.AMBASSADOR,
    steal: constants.CardNames.CAPTAIN
}

const BLOCKS = {
    foreign_aid: [{ id: 'duke', role: constants.CardNames.DUKE }],
    assassinate: [{ id: 'contessa', role: constants.CardNames.CONTESSA }],
    steal: [
        { id: 'ambassador', role: constants.CardNames.AMBASSADOR },
        { id: 'captain', role: constants.CardNames.CAPTAIN }
    ]
}

const DEFAULT_TIMEOUT_MS = 120000

const EVENT_TYPES = new Set([
    'action_declared', 'action_result', 'challenge_started', 'block_declared',
    'block_challenge_started', 'claim_proved', 'claim_not_proved',
    'influence_lost', 'player_eliminated'
])

const REACTION_OPTIONS = Object.freeze({
    support: Object.freeze(['like', 'bravo', 'laugh', 'skeptical']),
    aggressive: Object.freeze(['surprise', 'thinking', 'dislike', 'secret']),
    challenge: Object.freeze(['thinking', 'skeptical', 'surprise', 'bravo']),
    block: Object.freeze(['like', 'bravo', 'skeptical', 'surprise']),
    proved: Object.freeze(['bravo', 'surprise', 'secret', 'like']),
    failed: Object.freeze(['surprise', 'laugh', 'skeptical', 'dislike']),
    loss: Object.freeze(['surprise', 'dislike', 'thinking']),
    exchange: Object.freeze(['thinking', 'secret', 'like']),
    blocked: Object.freeze(['like', 'bravo', 'skeptical', 'surprise']),
    emptySteal: Object.freeze(['surprise', 'thinking', 'skeptical', 'dislike'])
})

function reactionsForEvent(event) {
    const { type, data = {} } = event
    if (type === 'action_declared') {
        if (data.action === 'exchange') return REACTION_OPTIONS.exchange
        if (data.action === 'coup' || data.action === 'assassinate') return REACTION_OPTIONS.aggressive
        return REACTION_OPTIONS.support
    }
    if (type === 'action_result') {
        if (data.action === 'exchange') return REACTION_OPTIONS.exchange
        if (data.result === 'blocked') return REACTION_OPTIONS.blocked
        if (data.action === 'steal' && data.amount === 0) return REACTION_OPTIONS.emptySteal
        return REACTION_OPTIONS.support
    }
    if (type === 'challenge_started' || type === 'block_challenge_started') return REACTION_OPTIONS.challenge
    if (type === 'block_declared') return REACTION_OPTIONS.block
    if (type === 'claim_proved') return REACTION_OPTIONS.proved
    if (type === 'claim_not_proved') return REACTION_OPTIONS.failed
    if (type === 'influence_lost' || type === 'player_eliminated') return REACTION_OPTIONS.loss
    return []
}

function cloneLogEvent(event) {
    return {
        ...event,
        data: { ...event.data },
        translation: { key: event.translation.key, params: { ...event.translation.params } },
        reactions: event.reactions.slice()
    }
}

function decisionTimeoutFromEnv() {
    const value = Number(process.env.DECISION_TIMEOUT_MS)
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS
}

class CoupGame {
    constructor(players, gameSocket, options = {}) {
        this.gameSocket = gameSocket
        this.rng = typeof options.rng === 'function' ? options.rng : Math.random
        this.decisionTimeoutMs = Number.isFinite(options.decisionTimeoutMs) && options.decisionTimeoutMs > 0
            ? options.decisionTimeoutMs
            : decisionTimeoutFromEnv()
        this.codexClient = options.codexClient || null
        this.isCodexDisabled = typeof options.isCodexDisabled === 'function' ? options.isCodexDisabled : () => false
        this.spectatorSocketIDs = Array.isArray(options.spectatorSocketIDs) ? options.spectatorSocketIDs.slice() : []
        const colors = ['#73C373', '#7AB8D3', '#DD6C75', '#8C6CE6', '#EA9158', '#CB8F8F']
        this.players = players.map((player, index) => ({
            seat: index,
            name: String(player.name || '').trim(),
            controller: player.controller === 'codex' ? 'codex' : 'human',
            effort: EFFORTS.has(player.effort) ? player.effort : 'medium',
            socketID: player.controller === 'codex' ? null : player.socketID,
            money: 0,
            influences: [],
            revealedInfluences: [],
            isDead: false,
            color: colors[index % colors.length]
        }))
        this.leaderSocketID = options.leaderSocketID || (this.players.length ? this.players[0].socketID : null)
        this.currentPlayer = 0
        this.deck = []
        this.gameNumber = 0
        this.decisionSerial = 0
        this.stateVersion = 0
        this.activeDecision = null
        this.decisionTimer = null
        this.pendingExchange = null
        this.codexRequests = new Map()
        this.publicHistory = []
        this.publicLogEvents = []
        this.logEventsByID = new Map()
        this.reactionsByEvent = new Map()
        this.reactionRequestsBySeat = new Map()
        this.reactionPresenceBySeat = new Map()
        this.logEventSerial = 0
        this.turnNumber = 0
        this.matchID = crypto.randomBytes(16).toString('hex')
        this.phase = 'lobby'
        this.previousWinner = null
        this.winner = null
        this.currentAction = null
    }

    start() {
        if (this.phase !== 'lobby') return false
        if (this.players.length < 2 || this.players.length > 6) return false
        const connectedHumanIDs = this.players.filter(player => player.controller === 'human').map(player => player.socketID)
        const connectedIDs = new Set([...connectedHumanIDs, ...this.spectatorSocketIDs].filter(Boolean))
        connectedIDs.forEach(socketID => {
            const socket = this.gameSocket.sockets && this.gameSocket.sockets[socketID]
            if (!socket) return
            if (this.seatForSocket(socketID) >= 0) {
                socket.on('g-submitDecision', envelope => this.submitDecision(socketID, envelope))
                socket.on('disconnect', () => this.onDisconnect(socketID))
            }
            socket.on('g-reactToEvent', payload => this.reactToEvent(socketID, payload))
            socket.on('g-requestEventLogState', payload => this.requestEventLogState(socketID, payload))
            socket.on('g-playAgain', payload => this.playAgain(socketID, payload))
            socket.on('g-resume', payload => this.resume(socketID, payload))
        })
        this.resetGame()
        this.phase = 'running'
        const disconnected = this.players.find(player => player.controller === 'human'
            && (!this.gameSocket.sockets || !this.gameSocket.sockets[player.socketID]))
        if (disconnected) {
            this.dissolve(disconnected.name)
            return false
        }
        this.updatePlayers()
        this.emitEventLogStateToAll()
        this.playTurn()
        return true
    }

    resetGame() {
        this.clearDecisionTimer()
        this.activeDecision = null
        this.pausedDecision = null
        this.pendingExchange = null
        this.gameNumber += 1
        this.stateVersion += 1
        this.phase = 'running'
        this.winner = null
        this.currentAction = null
        this.publicHistory = []
        this.publicLogEvents = []
        this.logEventsByID.clear()
        this.reactionsByEvent.clear()
        this.reactionRequestsBySeat.clear()
        this.reactionPresenceBySeat.clear()
        this.logEventSerial = 0
        this.turnNumber = 0
        this.matchID = crypto.randomBytes(16).toString('hex')
        this.deck = gameUtils.buildDeck(this.rng)

        if (Number.isInteger(this.previousWinner) && this.previousWinner >= 0 && this.previousWinner < this.players.length) {
            this.currentPlayer = this.previousWinner
        } else {
            this.currentPlayer = Math.floor(this.rng() * this.players.length)
        }

        this.players.forEach(player => {
            player.money = 2
            player.influences = [this.deck.pop(), this.deck.pop()]
            player.revealedInfluences = []
            player.isDead = false
        })
        if (this.players.length === 2) {
            this.players[this.currentPlayer].money = 1
        }
    }

    socketEmit(socketID, event, payload) {
        if (this.gameSocket && typeof this.gameSocket.to === 'function') {
            this.gameSocket.to(socketID).emit(event, payload)
        }
    }

    publicEmit(event, payload) {
        if (this.gameSocket && typeof this.gameSocket.emit === 'function') {
            this.gameSocket.emit(event, payload)
        }
    }

    updatePlayers() {
        const pendingDecisionSeats = this.unansweredDecisionSeats(this.activeDecision)
        const publicPlayers = this.players.map(player => ({
            name: player.name,
            controller: player.controller,
            ...(player.controller === 'codex' ? { effort: player.effort } : {}),
            money: player.money,
            color: player.color,
            isDead: player.isDead,
            influenceCount: player.influences.length,
            revealedInfluences: player.revealedInfluences.slice()
        }))
        this.players.filter(player => player.controller === 'human').forEach(player => {
            this.socketEmit(player.socketID, 'g-updatePlayers', {
                players: publicPlayers,
                ownInfluences: player.influences.slice(),
                courtCount: this.deck.length,
                currentPlayer: this.players[this.currentPlayer] ? this.players[this.currentPlayer].name : null,
                pendingDecisionSeats,
                phase: this.phase,
                stateVersion: this.stateVersion
            })
        })
        this.spectatorSocketIDs.forEach(socketID => this.socketEmit(socketID, 'g-updatePlayers', {
            players: publicPlayers,
            ownInfluences: [],
            courtCount: this.deck.length,
            currentPlayer: this.players[this.currentPlayer] ? this.players[this.currentPlayer].name : null,
            pendingDecisionSeats,
            phase: this.phase,
            stateVersion: this.stateVersion,
            spectator: true
        }))
    }

    addLog(type, data, translation) {
        if (!EVENT_TYPES.has(type) || !data || !translation || typeof translation.key !== 'string') {
            throw new TypeError('Event log entries require a known type, public data, and a translation key.')
        }
        const event = {
            id: `${this.matchID}-event-${++this.logEventSerial}`,
            type,
            turn: Math.max(1, this.turnNumber),
            data: { ...data },
            translation: { key: translation.key, params: { ...translation.params } },
            reactions: []
        }
        event.reactions = reactionsForEvent(event).slice()
        this.publicLogEvents.push(event)
        this.logEventsByID.set(event.id, event)
        this.publicEmit('g-addLog', cloneLogEvent(event))
        return event
    }

    reactionCounts(eventID) {
        const selections = this.reactionsByEvent.get(eventID)
        const counts = {}
        if (selections) selections.forEach(reaction => {
            counts[reaction] = (counts[reaction] || 0) + 1
        })
        return counts
    }

    eventLogSnapshot(socketID) {
        const seat = this.seatForSocket(socketID)
        const isSpectator = this.spectatorSocketIDs.includes(socketID)
        if (seat < 0 && !isSpectator) return null
        return {
            matchId: this.matchID,
            events: this.publicLogEvents.map(cloneLogEvent),
            reactionCounts: this.publicLogEvents.map(event => ({
                eventId: event.id,
                counts: this.reactionCounts(event.id)
            })),
            ownReactions: seat < 0 ? [] : this.publicLogEvents.reduce((selected, event) => {
                const reaction = this.reactionsByEvent.get(event.id)?.get(seat)
                if (reaction) selected.push({ eventId: event.id, reaction })
                return selected
            }, [])
        }
    }

    requestEventLogState(socketID, payload) {
        if (payload !== undefined) {
            this.socketEmit(socketID, 'g-reactionRejected', { requestId: null, reason: 'invalid_payload' })
            return false
        }
        const state = this.eventLogSnapshot(socketID)
        if (!state) return false
        this.socketEmit(socketID, 'g-eventLogState', state)
        return true
    }

    emitEventLogStateToAll() {
        const socketIDs = new Set([
            ...this.players.filter(player => player.controller === 'human').map(player => player.socketID),
            ...this.spectatorSocketIDs
        ])
        socketIDs.forEach(socketID => {
            const state = this.eventLogSnapshot(socketID)
            if (state) this.socketEmit(socketID, 'g-eventLogState', state)
        })
    }

    rejectReaction(socketID, requestId, reason) {
        this.socketEmit(socketID, 'g-reactionRejected', {
            requestId: typeof requestId === 'string' ? requestId : null,
            reason
        })
        return false
    }

    emitReactionState(socketID, seat, eventID, requestId) {
        this.publicEmit('g-reactionCounts', { eventId: eventID, counts: this.reactionCounts(eventID) })
        this.socketEmit(socketID, 'g-reactionOwn', {
            eventId: eventID,
            reaction: this.reactionsByEvent.get(eventID)?.get(seat) || null,
            requestId
        })
    }

    reactToEvent(socketID, payload) {
        const seat = this.seatForSocket(socketID)
        const validObject = payload && typeof payload === 'object' && !Array.isArray(payload)
            && Object.keys(payload).length === 3
            && Object.prototype.hasOwnProperty.call(payload, 'eventId')
            && Object.prototype.hasOwnProperty.call(payload, 'reaction')
            && Object.prototype.hasOwnProperty.call(payload, 'requestId')
        if (!validObject
            || typeof payload.eventId !== 'string' || payload.eventId.length > 128
            || typeof payload.reaction !== 'string'
            || typeof payload.requestId !== 'string' || !payload.requestId.length || payload.requestId.length > 128) {
            return this.rejectReaction(socketID, payload && payload.requestId, 'invalid_payload')
        }
        if (seat < 0 || this.phase === 'lobby') {
            return this.rejectReaction(socketID, payload.requestId, 'ineligible_actor')
        }
        const event = this.logEventsByID.get(payload.eventId)
        if (!event) return this.rejectReaction(socketID, payload.requestId, 'unknown_event')
        if (!event.reactions.includes(payload.reaction)) {
            return this.rejectReaction(socketID, payload.requestId, 'reaction_not_allowed')
        }

        let seenRequests = this.reactionRequestsBySeat.get(seat)
        if (!seenRequests) {
            seenRequests = new Map()
            this.reactionRequestsBySeat.set(seat, seenRequests)
        }
        if (seenRequests.has(payload.requestId)) {
            const priorRequest = seenRequests.get(payload.requestId)
            if (priorRequest.eventId !== event.id || priorRequest.reaction !== payload.reaction) {
                return this.rejectReaction(socketID, payload.requestId, 'duplicate_request_id')
            }
            this.emitReactionState(socketID, seat, event.id, payload.requestId)
            return true
        }
        seenRequests.set(payload.requestId, { eventId: event.id, reaction: payload.reaction })

        let selections = this.reactionsByEvent.get(event.id)
        if (!selections) {
            selections = new Map()
            this.reactionsByEvent.set(event.id, selections)
        }
        const current = selections.get(seat)
        if (current === payload.reaction) {
            selections.delete(seat)
            if (selections.size === 0) this.reactionsByEvent.delete(event.id)
            const presence = this.reactionPresenceBySeat.get(seat)
            if (presence && presence.eventId === event.id) {
                this.reactionPresenceBySeat.delete(seat)
                this.publicEmit('g-reactionPresence', { seat, reaction: null })
            }
        } else {
            selections.set(seat, payload.reaction)
            this.reactionPresenceBySeat.set(seat, { eventId: event.id, reaction: payload.reaction })
            this.publicEmit('g-reactionPresence', { seat, reaction: payload.reaction })
        }
        this.emitReactionState(socketID, seat, event.id, payload.requestId)
        return true
    }

    addHistory(event) {
        const entry = { turn: Math.max(1, this.turnNumber), ...event }
        this.publicHistory.push(entry)
        if (this.publicHistory.length > 120) this.publicHistory.shift()
        return entry
    }

    actorKey(player) {
        return player.controller === 'codex' ? `codex:${player.seat}` : player.socketID
    }

    cancelCodexRequests(code = 'cancelled') {
        this.codexRequests.forEach(controller => {
            controller.abort(Object.assign(new Error(code), { code }))
        })
        this.codexRequests.clear()
    }

    bumpVersion() {
        this.stateVersion += 1
    }

    clearDecisionTimer() {
        if (this.decisionTimer) {
            clearTimeout(this.decisionTimer)
            this.decisionTimer = null
        }
    }

    onDisconnect(socketID) {
        const player = this.players.find(candidate => candidate.socketID === socketID)
        if (!player || player.isDead || !['running', 'paused'].includes(this.phase)) return
        if (this.players.length < 3) return this.dissolve(player.name)
        this.eliminateDisconnectedPlayer(player)
    }

    emitDecisionClosed(decision) {
        if (!decision || !decision.id || !(decision.allowed instanceof Map)) return
        decision.allowed.forEach((_, actorKey) => {
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (!player || player.controller !== 'human') return
            this.socketEmit(player.socketID, 'g-decisionClosed', {
                decisionId: decision.id,
                stateVersion: this.stateVersion
            })
        })
    }

    discardDecision(decision) {
        this.clearDecisionTimer()
        if (this.activeDecision === decision) this.activeDecision = null
        if (this.pausedDecision === decision) this.pausedDecision = null
        this.cancelCodexRequests('cancelled')
        this.emitDecisionClosed(decision)
        this.bumpVersion()
    }

    restoreExchangeDraws(seat) {
        if (!this.pendingExchange || this.pendingExchange.seat !== seat) return false
        this.deck.push(...this.pendingExchange.drawn)
        this.deck = gameUtils.shuffleArray(this.deck, this.rng)
        this.pendingExchange = null
        return true
    }

    cancelActionAfterDisconnect(player, decision) {
        const wasPaused = this.phase === 'paused'
        this.restoreExchangeDraws(player.seat)
        if (this.currentAction) {
            this.currentAction.historyEntry.result = 'cancelled'
            if (this.currentAction.claimHistoryEntry) this.currentAction.claimHistoryEntry.result = 'cancelled'
        }
        if (decision) this.discardDecision(decision)
        else {
            this.clearDecisionTimer()
            this.cancelCodexRequests('cancelled')
            this.bumpVersion()
        }
        this.currentAction = null
        this.phase = 'running'
        if (wasPaused) this.publicEmit('g-gameResumed', { stateVersion: this.stateVersion })
        this.updatePlayers()
        this.advanceTurn()
        return true
    }

    continueAfterEliminatedDecision(decision, continuation) {
        const wasPaused = this.phase === 'paused'
        this.discardDecision(decision)
        this.phase = 'running'
        if (wasPaused) this.publicEmit('g-gameResumed', { stateVersion: this.stateVersion })
        this.updatePlayers()
        if (this.players.filter(player => !player.isDead).length <= 1) return this.advanceTurn()
        continuation()
        return true
    }

    continueWithoutDeadBlock(decision, block) {
        const wasPaused = this.phase === 'paused'
        block.historyEntry.result = 'cancelled'
        block.action.pendingBlock = null
        this.discardDecision(decision)
        this.phase = 'running'
        if (wasPaused) this.publicEmit('g-gameResumed', { stateVersion: this.stateVersion })
        this.updatePlayers()
        const actor = this.players[block.action.actor]
        if (!actor || actor.isDead) {
            block.action.historyEntry.result = 'cancelled'
            this.currentAction = null
            return this.advanceTurn()
        }
        this.resolveAction(block.action)
        return true
    }

    finishAfterDisconnect(decision) {
        this.clearDecisionTimer()
        this.cancelCodexRequests('cancelled')
        this.emitDecisionClosed(decision)
        this.activeDecision = null
        this.pausedDecision = null
        this.currentAction = null
        this.pendingExchange = null
        this.phase = 'running'
        this.advanceTurn()
        return true
    }

    resumeCompletedPausedDecision(decision) {
        this.pausedDecision = null
        this.phase = 'running'
        this.bumpVersion()
        this.publicEmit('g-gameResumed', { stateVersion: this.stateVersion })
        this.updatePlayers()
        decision.resolve(Array.from(decision.responses.values()))
        return true
    }

    eliminateDisconnectedPlayer(player) {
        if (!player || player.isDead || !['running', 'paused'].includes(this.phase)) return false
        const phaseBeforeDisconnect = this.phase
        const decision = phaseBeforeDisconnect === 'running' ? this.activeDecision : this.pausedDecision
        const actorKey = this.actorKey(player)
        const participates = Boolean(decision && decision.allowed instanceof Map && decision.allowed.has(actorKey))

        const lostInfluences = player.influences.slice()
        player.revealedInfluences.push(...lostInfluences)
        lostInfluences.forEach(card => this.addLog('influence_lost', {
            actorSeat: player.seat,
            role: String(card).toLowerCase()
        }, { key: 'game.log.influenceLost' }))
        player.influences = []
        this.checkEliminated()
        this.bumpVersion()

        if (phaseBeforeDisconnect === 'paused' && !decision) {
            this.updatePlayers()
            return true
        }

        const pendingBlock = this.currentAction && this.currentAction.pendingBlock
        if (decision && decision.type === 'block_challenge' && pendingBlock
            && pendingBlock.blocker === player.seat) {
            return this.continueWithoutDeadBlock(decision, pendingBlock)
        }

        const disconnectedActionActor = this.currentAction && this.currentAction.actor === player.seat
        const preservePendingInfluenceLoss = disconnectedActionActor
            && decision && decision.type === 'lose_influence' && !participates

        if (participates && decision.type === 'prove_claim' && decision.onSeatEliminated) {
            return this.continueAfterEliminatedDecision(decision, decision.onSeatEliminated)
        }
        if (participates && decision.type === 'lose_influence' && decision.onSeatEliminated) {
            return this.continueAfterEliminatedDecision(decision, decision.onSeatEliminated)
        }
        if (participates && decision.type === 'exchange') {
            return this.cancelActionAfterDisconnect(player, decision)
        }
        if ((disconnectedActionActor && !preservePendingInfluenceLoss)
            || (decision && decision.type === 'action' && this.currentPlayer === player.seat)) {
            return this.cancelActionAfterDisconnect(player, decision)
        }

        if (!preservePendingInfluenceLoss && this.players.filter(candidate => !candidate.isDead).length <= 1) {
            return this.finishAfterDisconnect(decision)
        }

        if (participates) {
            decision.allowed.delete(actorKey)
            decision.responses.delete(actorKey)
        }

        if (phaseBeforeDisconnect === 'paused' && decision) {
            decision.resumeOwnerSeats = decision.resumeOwnerSeats.filter(seat => {
                const owner = this.players[seat]
                return owner && !owner.isDead
            })
            if (decision.resumeOwnerSeats.length === 0) {
                if (decision.allowed.size === decision.responses.size) {
                    return this.resumeCompletedPausedDecision(decision)
                }
                return this.cancelActionAfterDisconnect(player, decision)
            }
            this.updatePlayers()
            return true
        }

        if (decision && decision.allowed.size === decision.responses.size) {
            this.closeDecision()
            return true
        }
        this.updatePlayers()
        return true
    }

    dissolve(playerName) {
        if (!['running', 'paused'].includes(this.phase)) return false
        this.phase = 'dissolved'
        this.bumpVersion()
        this.cancelCodexRequests('cancelled')
        this.clearDecisionTimer()
        this.activeDecision = null
        this.pausedDecision = null
        this.currentAction = null
        this.updatePlayers()
        this.publicEmit('g-gameDissolved', {
            playerName: String(playerName || ''),
            stateVersion: this.stateVersion
        })
        return true
    }

    unansweredDecisionSeats(decision) {
        if (!decision || !(decision.allowed instanceof Map) || !(decision.responses instanceof Map)) return []
        const seats = []
        decision.allowed.forEach((_, actorKey) => {
            if (decision.responses.has(actorKey)) return
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (player && !player.isDead) seats.push(player.seat)
        })
        return seats
    }

    unansweredHumanSeats(decision) {
        if (!decision || !(decision.allowed instanceof Map) || !(decision.responses instanceof Map)) return []
        const seats = []
        decision.allowed.forEach((_, actorKey) => {
            if (decision.responses.has(actorKey)) return
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (player && player.controller === 'human') seats.push(player.seat)
        })
        return seats
    }

    emitGamePaused(cause) {
        const ownerSeats = new Set(this.pausedDecision ? this.pausedDecision.resumeOwnerSeats : [])
        const recoverable = ownerSeats.size > 0
        const base = { cause, stateVersion: this.stateVersion }
        this.players.filter(player => player.controller === 'human').forEach(player => {
            const isOwner = ownerSeats.has(player.seat)
            this.socketEmit(player.socketID, 'g-gamePaused', {
                ...base,
                showOverlay: !recoverable || isOwner,
                canResume: recoverable && isOwner,
                waitingForOwner: recoverable && !isOwner
            })
        })
        this.spectatorSocketIDs.forEach(socketID => this.socketEmit(socketID, 'g-gamePaused', {
            ...base,
            showOverlay: !recoverable,
            canResume: false,
            waitingForOwner: recoverable
        }))
    }

    pause(cause, { recoverable = false } = {}) {
        if (this.phase !== 'running') return
        const decision = this.activeDecision
        const resumeOwnerSeats = recoverable ? this.unansweredHumanSeats(decision) : []
        this.cancelCodexRequests('cancelled')
        this.clearDecisionTimer()
        this.activeDecision = null
        this.pausedDecision = recoverable && decision && resumeOwnerSeats.length ? {
            type: decision.type,
            title: decision.title,
            description: decision.description,
            allowed: decision.allowed,
            responses: new Map(decision.responses),
            priorityFrom: decision.priorityFrom,
            closeWhenDetermined: decision.closeWhenDetermined,
            resumeOwnerSeats,
            onSeatEliminated: decision.onSeatEliminated,
            resolve: decision.resolve
        } : null
        this.bumpVersion()
        this.phase = 'paused'
        this.emitGamePaused(cause)
        this.updatePlayers()
    }

    rejectDecision(socketID, reason) {
        this.socketEmit(socketID, 'g-decisionRejected', { reason })
    }

    logActionResult(action, result, details = {}) {
        const data = {
            actorSeat: action.actor,
            action: action.type,
            result,
            ...(action.target == null ? {} : { targetSeat: action.target }),
            ...details
        }
        const key = action.type === 'exchange'
            ? 'game.log.exchangeResolved'
            : (result === 'blocked' ? 'game.log.actionBlocked' : 'game.log.actionResult')
        return this.addLog('action_result', data, { key })
    }

    isEnvelope(envelope) {
        if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) return false
        const keys = Object.keys(envelope).sort()
        return keys.length === 3 && keys[0] === 'choiceId' && keys[1] === 'decisionId' && keys[2] === 'stateVersion'
            && typeof envelope.decisionId === 'string'
            && typeof envelope.choiceId === 'string'
            && Number.isInteger(envelope.stateVersion)
    }

    submitDecision(socketID, envelope) {
        const seat = this.seatForSocket(socketID)
        if (seat < 0) {
            this.rejectDecision(socketID, 'This socket does not control a player seat.')
            return false
        }
        return this.submitChoice(seat, envelope, socketID)
    }

    submitChoice(seat, envelope, socketID = null) {
        if (!this.isEnvelope(envelope)) {
            if (socketID) this.rejectDecision(socketID, 'Expected decisionId, stateVersion, and choiceId only.')
            return false
        }
        const decision = this.activeDecision
        if (this.phase !== 'running' || !decision) {
            if (socketID) this.rejectDecision(socketID, 'There is no active decision.')
            return false
        }
        if (envelope.decisionId !== decision.id || envelope.stateVersion !== decision.stateVersion) {
            if (socketID) this.rejectDecision(socketID, 'Decision is stale or belongs to another phase.')
            return false
        }
        const player = this.players[seat]
        const actorKey = player && this.actorKey(player)
        const allowed = decision.allowed.get(actorKey)
        if (!allowed) {
            if (socketID) this.rejectDecision(socketID, 'This seat is not eligible for this decision.')
            return false
        }
        const choice = allowed.get(envelope.choiceId)
        if (!choice) {
            if (socketID) this.rejectDecision(socketID, 'Choice is not available to this seat.')
            return false
        }
        const prior = decision.responses.get(actorKey)
        if (prior) {
            if (prior.choiceId === envelope.choiceId) {
                if (socketID) this.socketEmit(socketID, 'g-decisionAccepted', { decisionId: decision.id, choiceId: envelope.choiceId })
                return true
            }
            if (socketID) this.rejectDecision(socketID, 'A different choice was already submitted.')
            return false
        }
        decision.responses.set(actorKey, { choiceId: envelope.choiceId, choice, seat })
        if (socketID) this.socketEmit(socketID, 'g-decisionAccepted', { decisionId: decision.id, choiceId: envelope.choiceId })
        const complete = decision.responses.size === decision.allowed.size
        const determined = decision.closeWhenDetermined
            && decision.closeWhenDetermined(decision.responses)
        if (complete || determined) this.closeDecision()
        else this.updatePlayers()
        return true
    }

    seatForSocket(socketID) {
        return this.players.findIndex(player => player.controller === 'human' && player.socketID === socketID)
    }

    createChoice(choiceId, label, value) {
        return { choiceId, label, value }
    }

    openDecision({ type, title, description, seats, optionsFor, priorityFrom, closeWhenDetermined, onSeatEliminated, resolve }) {
        if (this.phase !== 'running') return
        this.clearDecisionTimer()
        const allowed = new Map()
        const eligibleSeats = seats.filter(seat => this.players[seat] && !this.players[seat].isDead)
        eligibleSeats.forEach(seat => {
            const player = this.players[seat]
            const choices = optionsFor(seat)
            const choiceMap = new Map(choices.map(choice => [choice.choiceId, choice]))
            allowed.set(this.actorKey(player), choiceMap)
        })
        if (!allowed.size) {
            this.bumpVersion()
            resolve([])
            return
        }
        this.activateDecision({ type, title, description, allowed, priorityFrom, closeWhenDetermined, onSeatEliminated, resolve })
    }

    activateDecision(template) {
        this.clearDecisionTimer()
        this.bumpVersion()
        const id = `game-${this.matchID}-${this.gameNumber}-decision-${++this.decisionSerial}`
        this.activeDecision = {
            id,
            stateVersion: this.stateVersion,
            type: template.type,
            title: template.title,
            description: template.description,
            allowed: template.allowed,
            responses: template.responses instanceof Map ? new Map(template.responses) : new Map(),
            priorityFrom: template.priorityFrom,
            closeWhenDetermined: template.closeWhenDetermined,
            onSeatEliminated: template.onSeatEliminated,
            resolve: template.resolve
        }
        this.updatePlayers()
        template.allowed.forEach((choices, actorKey) => {
            if (this.activeDecision.responses.has(actorKey)) return
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (!player) return
            if (player.controller === 'human') {
                const firstChoice = choices.values().next().value
                this.socketEmit(player.socketID, 'g-decision', {
                    decisionId: id,
                    stateVersion: this.stateVersion,
                    type: template.type,
                    title: template.title,
                    description: template.description,
                    deadlineMs: this.decisionTimeoutMs,
                    ...(template.type === 'exchange' && firstChoice && firstChoice.poolSlots
                        ? { poolSlots: firstChoice.poolSlots.map(({ role, original }) => ({ role, original })) }
                        : {}),
                    options: Array.from(choices.values()).map(({ choiceId, label, roles }) => template.type === 'exchange'
                        ? { choiceId, roles: [...roles] }
                        : { choiceId, label })
                })
            }
        })
        this.decisionTimer = setTimeout(() => {
            if (this.activeDecision && this.activeDecision.id === id) {
                this.pause(`${template.type} decision timed out.`, { recoverable: true })
            }
        }, this.decisionTimeoutMs)
        if (this.decisionTimer && typeof this.decisionTimer.unref === 'function') this.decisionTimer.unref()
        template.allowed.forEach((_, actorKey) => {
            if (this.activeDecision.responses.has(actorKey)) return
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (player && player.controller === 'codex') this.requestCodexDecision(player, this.activeDecision)
        })
    }

    codexOption(choice, decisionType) {
        const value = choice.value || {}
        const option = { choiceId: choice.choiceId }
        if (value.action) {
            option.kind = 'action'
            option.action = value.action
            if (value.target != null) option.targetSeat = value.target
            option.cost = ACTION_COSTS[value.action] || 0
        } else if (value.kind === 'challenge') {
            option.kind = 'challenge'
        } else if (value.kind === 'block') {
            option.kind = 'block'
            option.role = String(value.role).toLowerCase()
        } else if (value.kind === 'prove') {
            option.kind = 'prove_claim'
            option.role = String(value.card).toLowerCase()
        } else if (value.kind === 'lose') {
            option.kind = 'lose_influence'
            option.role = String(value.card).toLowerCase()
        } else if (value.kind === 'exchange') {
            option.kind = 'exchange'
            option.keep = value.keep.map(role => String(role).toLowerCase())
        } else {
            option.kind = 'pass'
        }
        if (decisionType === 'challenge' || decisionType === 'block_challenge') {
            if (option.kind === 'pass') option.kind = 'pass'
        }
        return option
    }

    codexObservation(player, decision) {
        const observation = {
            seat: player.seat,
            decisionType: decision.type,
            publicState: {
                currentSeat: this.currentPlayer,
                players: this.players.map(candidate => ({
                    seat: candidate.seat,
                    coins: candidate.money,
                    alive: !candidate.isDead,
                    influenceCount: candidate.influences.length,
                    revealedRoles: candidate.revealedInfluences.map(role => String(role).toLowerCase())
                }))
            },
            ownInfluences: player.influences.map(role => String(role).toLowerCase()),
            history: this.publicHistory.slice(),
            options: Array.from(decision.allowed.get(this.actorKey(player)).values())
                .map(choice => this.codexOption(choice, decision.type))
        }
        const event = this.publicLogEvents.at(-1)
        const projectedEvent = event && event.reactions.length ? projectPublicEvent(event) : null
        if (event && projectedEvent) {
            const countsByReaction = Object.fromEntries(event.reactions.map(reaction => [reaction, 0]))
            const selections = this.reactionsByEvent.get(event.id)
            if (selections) selections.forEach((reaction, seat) => {
                if (seat !== player.seat && Object.prototype.hasOwnProperty.call(countsByReaction, reaction)) {
                    countsByReaction[reaction] += 1
                }
            })
            observation.reactionOpportunity = {
                eventId: event.id,
                event: projectedEvent,
                allowedReactions: event.reactions.slice(),
                countsByReaction
            }
        }
        return observation
    }

    applyCodexReaction(player, opportunity, candidate) {
        if (!player || player.controller !== 'codex' || !opportunity
            || !candidate || typeof candidate !== 'object' || Array.isArray(candidate)
            || Object.keys(candidate).length !== 2
            || !Object.prototype.hasOwnProperty.call(candidate, 'eventId')
            || !Object.prototype.hasOwnProperty.call(candidate, 'emoji')
            || candidate.eventId !== opportunity.eventId || typeof candidate.emoji !== 'string'
            || !opportunity.allowedReactions.includes(candidate.emoji)) return false
        const event = this.logEventsByID.get(opportunity.eventId)
        if (!event || !event.reactions.includes(candidate.emoji)) return false

        let selections = this.reactionsByEvent.get(event.id)
        const current = selections && selections.get(player.seat)
        if (current === candidate.emoji) return true
        if (!selections) {
            selections = new Map()
            this.reactionsByEvent.set(event.id, selections)
        }
        selections.set(player.seat, candidate.emoji)
        this.reactionPresenceBySeat.set(player.seat, { eventId: event.id, reaction: candidate.emoji })
        this.publicEmit('g-reactionPresence', { seat: player.seat, reaction: candidate.emoji })
        this.publicEmit('g-reactionCounts', { eventId: event.id, counts: this.reactionCounts(event.id) })
        return true
    }

    requestCodexDecision(player, decision) {
        if (!this.codexClient || this.isCodexDisabled()) {
            this.pause('Codex is disabled or unavailable. Re-enable it from the server before resuming or recreating the game.')
            return
        }
        const controller = new AbortController()
        const requestKey = `${decision.id}:${player.seat}`
        this.codexRequests.set(requestKey, controller)
        const startedAt = Date.now()
        const observation = this.codexObservation(player, decision)
        const reactionOpportunity = observation.reactionOpportunity || null
        Promise.resolve().then(() => this.codexClient.choose({
            decisionId: decision.id,
            stateVersion: decision.stateVersion,
            effort: player.effort,
            observation,
            signal: controller.signal
        })).then(result => {
            this.codexRequests.delete(requestKey)
            if (this.phase !== 'running' || !this.activeDecision || this.activeDecision.id !== decision.id
                || this.activeDecision.stateVersion !== decision.stateVersion) return
            if (!result || result.decisionId !== decision.id || result.stateVersion !== decision.stateVersion
                || result.rulesVersion !== RULESET_VERSION) {
                return this.pause('Codex returned a stale or invalid decision.')
            }
            const accepted = this.submitChoice(player.seat, {
                decisionId: result.decisionId,
                stateVersion: result.stateVersion,
                choiceId: result.choiceId
            })
            if (!accepted) this.pause('Codex returned an unavailable choice.')
            else {
                if (reactionOpportunity && result.reaction) {
                    this.applyCodexReaction(player, reactionOpportunity, result.reaction)
                }
                this.publicEmit('g-codexActivity', { seat: player.seat, effort: player.effort, durationMs: Date.now() - startedAt })
            }
        }).catch(error => {
            this.codexRequests.delete(requestKey)
            if (this.phase !== 'running' || !this.activeDecision || this.activeDecision.id !== decision.id) return
            if (error && error.code === 'cancelled') return
            const reason = error && ['disabled', 'codex_disabled'].includes(error.code)
                ? 'Codex was disabled by a player.'
                : 'Codex could not complete this decision. Check its login, usage limit, and runner, then resume or recreate the game.'
            this.pause(reason)
        })
    }

    disableCodex() {
        this.cancelCodexRequests('disabled')
        if (this.phase === 'running' && this.players.some(player => player.controller === 'codex')) {
            this.pause('Codex was disabled by a player. The owner must re-enable it on the server before starting a new AI decision.')
        }
    }

    resume(socketID, payload) {
        if (this.phase !== 'paused' || payload !== undefined) {
            this.rejectDecision(socketID, 'There is no timed-out decision to resume.')
            return false
        }
        if (!this.pausedDecision) {
            this.rejectDecision(socketID, 'This pause cannot be resumed; recreate the game.')
            return false
        }
        const requesterSeat = this.seatForSocket(socketID)
        if (requesterSeat < 0 || !this.pausedDecision.resumeOwnerSeats.includes(requesterSeat)) {
            this.rejectDecision(socketID, 'Only a player who did not answer this decision can resume it.')
            return false
        }
        while (['paused', 'running'].includes(this.phase)) {
            const disconnectedHumans = this.players.filter(player => !player.isDead && player.controller === 'human'
                && (!this.gameSocket.sockets || !this.gameSocket.sockets[player.socketID]))
            if (!disconnectedHumans.length) break
            const action = this.currentAction
            const prioritySeats = [
                action && this.players[action.actor],
                action && action.pendingBlock && this.players[action.pendingBlock.blocker],
                action && Number.isInteger(action.target) ? this.players[action.target] : null
            ]
            const disconnected = prioritySeats.find(player => player && disconnectedHumans.includes(player))
                || disconnectedHumans[0]
            if (this.players.length < 3) {
                this.rejectDecision(socketID, 'Every seat must still be connected to resume.')
                this.dissolve(disconnected.name)
                return false
            }
            this.onDisconnect(disconnected.socketID)
        }
        // A disconnect may have resolved or cancelled the paused decision and
        // moved the game to running. Keep pruning the actor, pending blocker,
        // target, and other offline seats above before returning success.
        if (this.phase !== 'paused') return true
        if (!this.pausedDecision) {
            this.rejectDecision(socketID, 'There is no timed-out decision to resume.')
            return false
        }
        const decision = this.pausedDecision
        this.pausedDecision = null
        this.phase = 'running'
        this.activateDecision(decision)
        this.updatePlayers()
        this.publicEmit('g-gameResumed', { stateVersion: this.stateVersion })
        return true
    }

    closeDecision() {
        const decision = this.activeDecision
        if (!decision) return
        this.clearDecisionTimer()
        this.activeDecision = null
        this.bumpVersion()
        decision.allowed.forEach((_, actorKey) => {
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (!player || player.controller !== 'human') return
            this.socketEmit(player.socketID, 'g-decisionClosed', {
                decisionId: decision.id,
                stateVersion: this.stateVersion
            })
        })
        this.updatePlayers()
        const responses = Array.from(decision.responses.values())
        decision.resolve(responses)
    }

    nextInPriorityOrder(fromSeat, eligibleSeats) {
        const eligible = new Set(eligibleSeats)
        const result = []
        for (let offset = 1; offset <= this.players.length; offset += 1) {
            const seat = (fromSeat + offset) % this.players.length
            if (eligible.has(seat)) result.push(seat)
        }
        return result
    }

    windowIsDetermined(anchor, eligibleSeats, responses) {
        const bySeat = new Map(Array.from(responses.values(), response => [response.seat, response]))
        for (const seat of this.nextInPriorityOrder(anchor, eligibleSeats)) {
            const response = bySeat.get(seat)
            if (!response) return false
            if (response.choice.value.kind !== 'pass') return true
        }
        return false
    }

    openWindow({ type, title, description, seats, anchor, optionForSeat, resolve }) {
        const eligibleSeats = seats.filter(seat => !this.players[seat].isDead)
        this.openDecision({
            type,
            title,
            description,
            seats: eligibleSeats,
            priorityFrom: anchor,
            closeWhenDetermined: responses => this.windowIsDetermined(anchor, eligibleSeats, responses),
            optionsFor: seat => [
                this.createChoice('pass', 'Pass', { kind: 'pass' }),
                ...optionForSeat(seat)
            ],
            resolve: responses => {
                const orderedSeats = this.nextInPriorityOrder(anchor, eligibleSeats)
                const bySeat = new Map(responses.map(response => [response.seat, response]))
                const selected = orderedSeats
                    .map(seat => bySeat.get(seat))
                    .find(response => response && response.choice.value.kind !== 'pass') || null
                resolve(selected)
            }
        })
    }

    playTurn() {
        if (this.phase !== 'running') return
        const player = this.players[this.currentPlayer]
        if (!player || player.isDead) return this.advanceTurn()
        this.turnNumber += 1
        this.publicEmit('g-updateCurrentPlayer', player.name)
        const choices = this.actionChoices(this.currentPlayer)
        this.openDecision({
            type: 'action',
            title: 'Choose an action',
            description: `${player.name}, choose your action.`,
            seats: [this.currentPlayer],
            optionsFor: () => choices,
            resolve: responses => {
                const response = responses[0]
                if (!response) return this.pause('The active player did not choose an action.')
                this.beginAction(response.choice.value)
            }
        })
    }

    actionChoices(actorSeat) {
        const player = this.players[actorSeat]
        const aliveTargets = this.players.filter(target => !target.isDead && target.seat !== actorSeat)
        const targets = action => aliveTargets.map(target => this.createChoice(
            `${action}:${target.seat}`,
            `${this.actionLabel(action)} — ${target.name}`,
            { action, target: target.seat }
        ))
        if (player.money >= 10) return targets('coup')
        const choices = [
            this.createChoice('income', 'Income (+1 coin)', { action: 'income' }),
            this.createChoice('foreign_aid', 'Foreign aid (+2 coins)', { action: 'foreign_aid' }),
            this.createChoice('tax', 'Tax (+3 coins; Duke)', { action: 'tax' }),
            this.createChoice('exchange', 'Exchange (Ambassador)', { action: 'exchange' }),
            ...targets('steal')
        ]
        if (player.money >= 3) choices.push(...targets('assassinate'))
        if (player.money >= 7) choices.push(...targets('coup'))
        return choices
    }

    actionLabel(action) {
        return ({ income: 'Income', foreign_aid: 'Foreign aid', coup: 'Coup', tax: 'Tax', assassinate: 'Assassinate', exchange: 'Exchange', steal: 'Steal' })[action] || action
    }

    beginAction(choice) {
        const actor = this.currentPlayer
        const action = { type: choice.action, actor, target: choice.target == null ? null : choice.target }
        const cost = action.type === 'coup' ? 7 : (action.type === 'assassinate' ? 3 : 0)
        if (cost && this.players[actor].money < cost) return this.playTurn()
        if (action.type !== 'coup' && this.players[actor].money >= 10) return this.playTurn()
        if (action.target != null && (!this.players[action.target] || this.players[action.target].isDead || action.target === actor)) return this.playTurn()
        action.cost = cost
        action.historyEntry = this.addHistory({
            type: 'action',
            actorSeat: actor,
            action: action.type,
            ...(action.target == null ? {} : { targetSeat: action.target }),
            result: 'resolved'
        })
        this.currentAction = action
        if (cost) this.players[actor].money -= cost
        const logKey = action.target == null ? 'game.log.actionUsed' : 'game.log.actionUsedTarget'
        this.addLog('action_declared', {
            actorSeat: actor,
            action: action.type,
            ...(action.target == null ? {} : { targetSeat: action.target }),
            ...(ROLE_BY_ACTION[action.type] ? { claimRole: String(ROLE_BY_ACTION[action.type]).toLowerCase() } : {})
        }, { key: logKey })
        this.updatePlayers()
        const claim = ROLE_BY_ACTION[action.type]
        if (!claim) return this.afterActionClaim(action)
        action.claimHistoryEntry = this.addHistory({
            type: 'claim',
            actorSeat: action.actor,
            action: action.type,
            claimRole: String(claim).toLowerCase(),
            result: 'resolved'
        })
        this.openChallengeWindow(action, claim)
    }

    openChallengeWindow(action, role) {
        const challengerSeats = this.players.filter(player => !player.isDead && player.seat !== action.actor).map(player => player.seat)
        this.openWindow({
            type: 'challenge',
            title: 'Challenge or pass',
            description: `${this.players[action.actor].name} claims ${role} for ${this.actionLabel(action.type)}.`,
            seats: challengerSeats,
            anchor: action.actor,
            optionForSeat: () => [this.createChoice('challenge', 'Challenge', { kind: 'challenge' })],
            resolve: selected => {
                if (!selected) return this.afterActionClaim(action)
                action.claimHistoryEntry.result = 'challenged'
                this.addHistory({
                    type: 'challenge', actorSeat: selected.seat, targetSeat: action.actor,
                    action: action.type, claimRole: String(role).toLowerCase(), result: 'challenged'
                })
                this.addLog('challenge_started', {
                    actorSeat: selected.seat,
                    targetSeat: action.actor,
                    action: action.type,
                    claimRole: String(role).toLowerCase()
                }, { key: 'game.log.challengeStarted' })
                this.openProofDecision({
                    claimant: action.actor,
                    challenger: selected.seat,
                    roles: [role],
                    historyEntry: action.claimHistoryEntry,
                    description: `${this.players[action.actor].name} must prove the ${role} claim.`,
                    onProved: () => this.loseInfluence(selected.seat, () => {
                        if (action.type === 'assassinate' && selected.seat === action.target) {
                            return this.resolveAction(action)
                        }
                        this.afterActionClaim(action)
                    }),
                    onConceded: () => {
                        action.historyEntry.result = 'failed'
                        if (action.cost && !this.players[action.actor].isDead) this.players[action.actor].money += action.cost
                        this.updatePlayers()
                        this.loseInfluence(action.actor, () => this.advanceTurn())
                    }
                })
            }
        })
    }

    afterActionClaim(action) {
        if (this.phase !== 'running') return
        if (BLOCKS[action.type]) return this.openBlockWindow(action)
        this.resolveAction(action)
    }

    openBlockWindow(action) {
        let eligible
        if (action.type === 'foreign_aid') {
            eligible = this.players.filter(player => !player.isDead && player.seat !== action.actor).map(player => player.seat)
        } else {
            eligible = this.players[action.target] && !this.players[action.target].isDead ? [action.target] : []
        }
        this.openWindow({
            type: 'block',
            title: 'Block or pass',
            description: action.type === 'foreign_aid'
                ? `${this.players[action.actor].name} takes foreign aid; any other active player may block with the Duke.`
                : `${this.players[action.target].name} may block ${this.actionLabel(action.type)}.`,
            seats: eligible,
            anchor: action.actor,
            optionForSeat: () => BLOCKS[action.type].map(block => this.createChoice(
                `block:${block.id}`,
                `Block with ${block.role}`,
                { kind: 'block', role: block.role }
            )),
            resolve: selected => {
                if (!selected) {
                    action.historyEntry.result = 'resolved'
                    return this.resolveAction(action)
                }
                const block = { action, blocker: selected.seat, role: selected.choice.value.role }
                block.historyEntry = this.addHistory({
                    type: 'block', actorSeat: block.blocker, targetSeat: action.actor,
                    action: action.type, claimRole: String(block.role).toLowerCase(), result: 'resolved'
                })
                this.addLog('block_declared', {
                    actorSeat: block.blocker,
                    targetSeat: action.actor,
                    action: action.type,
                    claimRole: String(block.role).toLowerCase()
                }, { key: 'game.log.blockDeclared' })
                this.challengeBlock(block)
            }
        })
    }

    challengeBlock(block) {
        block.action.pendingBlock = block
        const challengers = this.players.filter(player => !player.isDead && player.seat !== block.blocker).map(player => player.seat)
        this.openWindow({
            type: 'block_challenge',
            title: 'Challenge or pass',
            description: `${this.players[block.blocker].name} claims ${block.role} to block.`,
            seats: challengers,
            anchor: block.blocker,
            optionForSeat: () => [this.createChoice('challenge', 'Challenge', { kind: 'challenge' })],
            resolve: selected => {
                if (block.action.pendingBlock === block) block.action.pendingBlock = null
                const blocker = this.players[block.blocker]
                if (!blocker || blocker.isDead) {
                    block.historyEntry.result = 'cancelled'
                    return this.resolveAction(block.action)
                }
                if (!selected) {
                    block.historyEntry.result = 'resolved'
                    block.action.historyEntry.result = 'blocked'
                    if (block.action.type === 'foreign_aid') {
                        this.logActionResult(block.action, 'blocked', { blockerSeat: block.blocker, amount: 0 })
                    }
                    return this.advanceTurn()
                }
                block.historyEntry.result = 'challenged'
                this.addHistory({
                    type: 'block_challenge', actorSeat: selected.seat, targetSeat: block.blocker,
                    action: block.action.type, claimRole: String(block.role).toLowerCase(), result: 'challenged'
                })
                this.addLog('block_challenge_started', {
                    actorSeat: selected.seat,
                    targetSeat: block.blocker,
                    action: block.action.type,
                    claimRole: String(block.role).toLowerCase()
                }, { key: 'game.log.blockChallengeStarted' })
                this.openProofDecision({
                    claimant: block.blocker,
                    challenger: selected.seat,
                    roles: block.role === constants.CardNames.CAPTAIN || block.role === constants.CardNames.AMBASSADOR
                        ? [constants.CardNames.CAPTAIN, constants.CardNames.AMBASSADOR]
                        : [block.role],
                    historyEntry: block.historyEntry,
                    description: `${this.players[block.blocker].name} must prove the blocking claim.`,
                    onProved: () => {
                        block.action.historyEntry.result = 'blocked'
                        if (block.action.type === 'foreign_aid') {
                            this.logActionResult(block.action, 'blocked', { blockerSeat: block.blocker, amount: 0 })
                        }
                        this.loseInfluence(selected.seat, () => this.advanceTurn())
                    },
                    onConceded: () => this.loseInfluence(block.blocker, () => this.resolveAction(block.action))
                })
            }
        })
    }

    openProofDecision({ claimant, challenger, roles, historyEntry, description, onProved, onConceded }) {
        const player = this.players[claimant]
        if (!player || player.isDead) {
            if (historyEntry) historyEntry.result = 'failed'
            this.addLog('claim_not_proved', {
                actorSeat: claimant,
                ...(historyEntry && historyEntry.action ? { action: historyEntry.action } : {}),
                ...(historyEntry && historyEntry.claimRole ? { claimRole: historyEntry.claimRole } : {})
            }, { key: 'game.log.claimNotProved' })
            return onConceded()
        }
        const heldRoles = player.influences.filter(card => roles.includes(card))
        const choices = heldRoles.map((card, index) => this.createChoice(
            `prove:${card}:${index}`,
            `Show ${card}`,
            { kind: 'prove', card }
        ))
        choices.push(this.createChoice('concede', 'Do not prove; lose influence', { kind: 'concede' }))
        const concede = () => {
            if (historyEntry) historyEntry.result = 'failed'
            this.addLog('claim_not_proved', {
                actorSeat: claimant,
                ...(historyEntry && historyEntry.action ? { action: historyEntry.action } : {}),
                ...(historyEntry && historyEntry.claimRole ? { claimRole: historyEntry.claimRole } : {})
            }, { key: 'game.log.claimNotProved' })
            onConceded()
        }
        this.openDecision({
            type: 'prove_claim',
            title: 'Prove or concede',
            description,
            seats: [claimant],
            optionsFor: () => choices,
            onSeatEliminated: concede,
            resolve: responses => {
                const response = responses[0]
                if (!response) return this.pause('Claimant did not resolve the challenge.')
                if (response.choice.value.kind === 'prove') {
                    const provenCard = response.choice.value.card
                    if (historyEntry) historyEntry.result = 'proved'
                    this.addLog('claim_proved', {
                        actorSeat: claimant,
                        ...(historyEntry && historyEntry.action ? { action: historyEntry.action } : {}),
                        role: String(provenCard).toLowerCase()
                    }, { key: 'game.log.claimProved' })
                    this.returnProvenInfluence(claimant, provenCard)
                    this.updatePlayers()
                    onProved()
                } else {
                    concede()
                }
            }
        })
    }

    returnProvenInfluence(seat, card) {
        const player = this.players[seat]
        const index = player.influences.indexOf(card)
        if (index < 0) return false
        player.influences.splice(index, 1)
        this.deck.push(card)
        this.deck = gameUtils.shuffleArray(this.deck, this.rng)
        const replacement = this.deck.pop()
        if (replacement) player.influences.push(replacement)
        return true
    }

    loseInfluence(seat, onLost) {
        if (this.phase !== 'running') return
        const continueAfterLoss = () => {
            const action = this.currentAction
            if (action && this.players[action.actor] && this.players[action.actor].isDead) {
                action.historyEntry.result = 'cancelled'
                this.currentAction = null
                return this.advanceTurn()
            }
            return onLost()
        }
        const player = this.players[seat]
        if (!player || player.isDead || player.influences.length === 0) {
            this.checkEliminated()
            this.updatePlayers()
            return continueAfterLoss()
        }
        const options = player.influences.map((card, index) => this.createChoice(
            `lose:${index}`,
            `Reveal and lose ${card}`,
            { kind: 'lose', card, index }
        ))
        this.openDecision({
            type: 'lose_influence',
            title: 'Choose an influence to lose',
            description: 'The chosen card will be revealed and remain out of the Court deck.',
            seats: [seat],
            optionsFor: () => options,
            onSeatEliminated: continueAfterLoss,
            resolve: responses => {
                const response = responses[0]
                if (!response) return this.pause('Influence loss was not resolved.')
                const cardIndex = this.players[seat].influences.indexOf(response.choice.value.card)
                if (cardIndex < 0) return this.pause('Influence changed during a loss decision.')
                const [card] = this.players[seat].influences.splice(cardIndex, 1)
                player.revealedInfluences.push(card)
                this.addLog('influence_lost', {
                    actorSeat: seat,
                    role: String(card).toLowerCase()
                }, { key: 'game.log.influenceLost' })
                this.checkEliminated()
                this.addHistory({
                    type: 'influence_loss', actorSeat: seat, revealedRole: String(card).toLowerCase(),
                    result: player.isDead ? 'eliminated' : 'resolved'
                })
                this.updatePlayers()
                continueAfterLoss()
            }
        })
    }

    checkEliminated() {
        this.players.forEach(player => {
            if (!player.isDead && player.influences.length === 0) {
                player.isDead = true
                player.money = 0
                this.addLog('player_eliminated', {
                    actorSeat: player.seat
                }, { key: 'game.log.playerEliminated' })
            }
        })
    }

    resolveAction(action) {
        if (this.phase !== 'running') return
        const actor = this.players[action.actor]
        const target = action.target == null ? null : this.players[action.target]
        if (action.type === 'income') {
            actor.money += 1
            this.logActionResult(action, 'resolved', { amount: 1 })
        } else if (action.type === 'foreign_aid') {
            actor.money += 2
            this.logActionResult(action, 'resolved', { amount: 2 })
        } else if (action.type === 'tax') {
            actor.money += 3
            this.logActionResult(action, 'resolved', { amount: 3 })
        }
        else if (action.type === 'steal' && target && !target.isDead) {
            const amount = Math.min(2, target.money)
            target.money -= amount
            actor.money += amount
            this.logActionResult(action, 'resolved', { amount })
        } else if ((action.type === 'coup' || action.type === 'assassinate') && target && !target.isDead) {
            action.historyEntry.result = 'resolved'
            return this.loseInfluence(action.target, () => this.advanceTurn())
        } else if (action.type === 'exchange') {
            action.historyEntry.result = 'resolved'
            const drawn = [this.deck.pop(), this.deck.pop()].filter(Boolean)
            this.updatePlayers()
            return this.openExchange(action.actor, drawn)
        }
        if (action.historyEntry.result !== 'blocked') action.historyEntry.result = 'resolved'
        this.updatePlayers()
        this.advanceTurn()
    }

    openExchange(seat, drawn) {
        const player = this.players[seat]
        const pool = player.influences.concat(drawn)
        this.pendingExchange = { seat, drawn: drawn.slice() }
        const combinations = []
        const keepCount = player.influences.length
        const selectCombination = (start, selected) => {
            if (selected.length === keepCount) {
                combinations.push(selected)
                return
            }
            for (let index = start; index < pool.length; index += 1) {
                selectCombination(index + 1, selected.concat(index))
            }
        }
        selectCombination(0, [])
        const options = []
        const seenRoleSets = new Set()
        const poolSlots = pool.map((role, index) => ({
            role: String(role).toLowerCase(),
            original: index < keepCount
        }))
        combinations.forEach(keptIndices => {
            const kept = keptIndices.map(poolIndex => pool[poolIndex])
            const roles = kept.map(card => String(card).toLowerCase()).sort()
            const signature = JSON.stringify(roles)
            if (seenRoleSets.has(signature)) return
            seenRoleSets.add(signature)
            const label = `Keep ${kept.join(' and ')}`
            const choice = this.createChoice(`exchange:${options.length}`, label, { kind: 'exchange', keptIndices, keep: kept })
            choice.roles = roles
            choice.poolSlots = poolSlots
            options.push(choice)
        })
        this.openDecision({
            type: 'exchange',
            title: `Choose ${keepCount === 1 ? 'one influence' : 'two influences'} to keep`,
            description: `Keep exactly ${keepCount} ${keepCount === 1 ? 'influence' : 'influences'} from your current cards and the two private Court draws.`,
            seats: [seat],
            optionsFor: () => options,
            resolve: responses => {
                const response = responses[0]
                if (!response) return this.pause('Exchange was not resolved.')
                const keptIndices = new Set(response.choice.value.keptIndices)
                const kept = pool.filter((card, index) => keptIndices.has(index))
                const returned = pool.filter((card, index) => !keptIndices.has(index))
                player.influences = kept
                this.deck.push(...returned)
                this.deck = gameUtils.shuffleArray(this.deck, this.rng)
                this.pendingExchange = null
                this.updatePlayers()
                this.logActionResult({ actor: seat, type: 'exchange', target: null }, 'resolved')
                this.advanceTurn()
            }
        })
    }

    advanceTurn() {
        if (this.phase !== 'running') return
        this.currentAction = null
        this.checkEliminated()
        this.bumpVersion()
        this.updatePlayers()
        const alive = this.players.filter(player => !player.isDead)
        if (alive.length <= 1) {
            const winner = alive[0]
            if (!winner) return this.pause('No active player remains.')
            this.phase = 'gameover'
            this.activeDecision = null
            this.previousWinner = winner.seat
            this.winner = winner.name
            this.publicEmit('g-gameOver', winner.name)
            if (this.leaderSocketID) this.socketEmit(this.leaderSocketID, 'g-canPlayAgain', true)
            this.updatePlayers()
            return
        }
        do {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length
        } while (this.players[this.currentPlayer].isDead)
        this.playTurn()
    }

    playAgain(socketID, payload) {
        if (socketID !== this.leaderSocketID || this.phase !== 'gameover' || payload !== undefined) {
            this.rejectDecision(socketID, 'Only the current lobby leader can restart after game over.')
            return false
        }
        this.resetGame()
        this.updatePlayers()
        this.emitEventLogStateToAll()
        this.playTurn()
        return true
    }
}

module.exports = CoupGame
