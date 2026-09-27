const gameUtils = require('./utils')
const constants = require('../utilities/constants')
const crypto = require('node:crypto')
const { RULESET_VERSION } = require('../ai/codex-protocol')

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

const DEFAULT_TIMEOUT_MS = 60000

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
        this.codexRequests = new Map()
        this.publicHistory = []
        this.turnNumber = 0
        this.matchID = crypto.randomBytes(16).toString('hex')
        this.phase = 'lobby'
        this.previousWinner = null
        this.winner = null
        this.currentAction = null
    }

    start() {
        if (this.players.length < 2 || this.players.length > 6) return false
        const connectedHumanIDs = this.players.filter(player => player.controller === 'human').map(player => player.socketID)
        const connectedIDs = new Set([...connectedHumanIDs, ...this.spectatorSocketIDs].filter(Boolean))
        connectedIDs.forEach(socketID => {
            const socket = this.gameSocket.sockets && this.gameSocket.sockets[socketID]
            if (!socket) return
            if (this.players.some(player => player.socketID === socketID)) {
                socket.on('g-submitDecision', envelope => this.submitDecision(socketID, envelope))
                socket.on('disconnect', () => this.onDisconnect(socketID))
            }
            socket.on('g-playAgain', payload => this.playAgain(socketID, payload))
            socket.on('g-resume', payload => this.resume(socketID, payload))
        })
        this.resetGame()
        this.phase = 'running'
        const disconnected = this.players.find(player => player.controller === 'human'
            && (!this.gameSocket.sockets || !this.gameSocket.sockets[player.socketID]))
        if (disconnected) {
            this.pause(`${disconnected.name} disconnected before the game started.`)
            return false
        }
        this.updatePlayers()
        this.playTurn()
        return true
    }

    resetGame() {
        this.clearDecisionTimer()
        this.activeDecision = null
        this.pausedDecision = null
        this.gameNumber += 1
        this.stateVersion += 1
        this.phase = 'running'
        this.winner = null
        this.currentAction = null
        this.publicHistory = []
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
                currentPlayer: this.players[this.currentPlayer] ? this.players[this.currentPlayer].name : null,
                phase: this.phase,
                stateVersion: this.stateVersion
            })
        })
        this.spectatorSocketIDs.forEach(socketID => this.socketEmit(socketID, 'g-updatePlayers', {
            players: publicPlayers,
            ownInfluences: [],
            currentPlayer: this.players[this.currentPlayer] ? this.players[this.currentPlayer].name : null,
            phase: this.phase,
            stateVersion: this.stateVersion,
            spectator: true
        }))
    }

    addLog(message) {
        this.publicEmit('g-addLog', message)
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
        if (!player || this.phase === 'gameover') return
        const cause = `${player.name} disconnected; recreate the game to continue.`
        if (this.phase === 'paused') {
            this.pausedDecision = null
            this.bumpVersion()
            this.publicEmit('g-gamePaused', { cause, canResume: false, stateVersion: this.stateVersion })
            this.updatePlayers()
            return
        }
        this.pause(cause)
    }

    pause(cause, { recoverable = false } = {}) {
        if (this.phase === 'paused' || this.phase === 'gameover') return
        const decision = this.activeDecision
        this.cancelCodexRequests('cancelled')
        this.clearDecisionTimer()
        this.activeDecision = null
        this.pausedDecision = recoverable && decision ? {
            type: decision.type,
            title: decision.title,
            description: decision.description,
            allowed: decision.allowed,
            priorityFrom: decision.priorityFrom,
            resolve: decision.resolve
        } : null
        this.bumpVersion()
        this.phase = 'paused'
        this.publicEmit('g-gamePaused', {
            cause,
            canResume: Boolean(this.pausedDecision),
            stateVersion: this.stateVersion
        })
        this.updatePlayers()
    }

    rejectDecision(socketID, reason) {
        this.socketEmit(socketID, 'g-decisionRejected', { reason })
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
        if (decision.responses.size === decision.allowed.size) this.closeDecision()
        return true
    }

    seatForSocket(socketID) {
        return this.players.findIndex(player => player.controller === 'human' && player.socketID === socketID)
    }

    createChoice(choiceId, label, value) {
        return { choiceId, label, value }
    }

    openDecision({ type, title, description, seats, optionsFor, priorityFrom, resolve }) {
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
        this.activateDecision({ type, title, description, allowed, priorityFrom, resolve })
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
            responses: new Map(),
            priorityFrom: template.priorityFrom,
            resolve: template.resolve
        }
        template.allowed.forEach((choices, actorKey) => {
            const player = this.players.find(candidate => this.actorKey(candidate) === actorKey)
            if (!player) return
            if (player.controller === 'human') this.socketEmit(player.socketID, 'g-decision', {
                decisionId: id,
                stateVersion: this.stateVersion,
                type: template.type,
                title: template.title,
                description: template.description,
                deadlineMs: this.decisionTimeoutMs,
                options: Array.from(choices.values()).map(({ choiceId, label }) => ({ choiceId, label }))
            })
        })
        this.decisionTimer = setTimeout(() => {
            if (this.activeDecision && this.activeDecision.id === id) {
                this.pause(`${template.type} decision timed out.`, { recoverable: true })
            }
        }, this.decisionTimeoutMs)
        if (this.decisionTimer && typeof this.decisionTimer.unref === 'function') this.decisionTimer.unref()
        template.allowed.forEach((_, actorKey) => {
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
        return {
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
        Promise.resolve().then(() => this.codexClient.choose({
            decisionId: decision.id,
            stateVersion: decision.stateVersion,
            effort: player.effort,
            observation: this.codexObservation(player, decision),
            signal: controller.signal
        })).then(result => {
            this.codexRequests.delete(requestKey)
            if (this.phase !== 'running' || !this.activeDecision || this.activeDecision.id !== decision.id) return
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
            else this.publicEmit('g-codexActivity', { seat: player.seat, effort: player.effort, durationMs: Date.now() - startedAt })
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
        if (socketID !== this.leaderSocketID) {
            this.rejectDecision(socketID, 'Only the lobby leader can resume a timed-out decision.')
            return false
        }
        if (this.phase !== 'paused' || payload !== undefined) {
            this.rejectDecision(socketID, 'There is no timed-out decision to resume.')
            return false
        }
        if (!this.pausedDecision) {
            this.rejectDecision(socketID, 'This pause cannot be resumed; recreate the game.')
            return false
        }
        const disconnected = this.players.find(player => player.controller === 'human'
            && (!this.gameSocket.sockets || !this.gameSocket.sockets[player.socketID]))
        if (disconnected) {
            this.pausedDecision = null
            this.bumpVersion()
            this.rejectDecision(socketID, 'Every seat must still be connected to resume.')
            this.publicEmit('g-gamePaused', {
                cause: `${disconnected.name} disconnected; recreate the game to continue.`,
                canResume: false,
                stateVersion: this.stateVersion
            })
            this.updatePlayers()
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

    openWindow({ type, title, description, seats, anchor, optionForSeat, resolve }) {
        const eligibleSeats = seats.filter(seat => !this.players[seat].isDead)
        this.openDecision({
            type,
            title,
            description,
            seats: eligibleSeats,
            priorityFrom: anchor,
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
        if (action.type === 'coup' && this.players[actor].money < 10) return this.playTurn()
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
        this.addLog(`${this.players[actor].name} used ${this.actionLabel(action.type)}${action.target == null ? '' : ` on ${this.players[action.target].name}`}.`)
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
                this.addLog(`${this.players[selected.seat].name} challenged ${this.players[action.actor].name}.`)
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
                        if (action.cost) this.players[action.actor].money += action.cost
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
                this.addLog(`${this.players[block.blocker].name} declared a block with ${block.role}.`)
                this.challengeBlock(block)
            }
        })
    }

    challengeBlock(block) {
        const challengers = this.players.filter(player => !player.isDead && player.seat !== block.blocker).map(player => player.seat)
        this.openWindow({
            type: 'block_challenge',
            title: 'Challenge or pass',
            description: `${this.players[block.blocker].name} claims ${block.role} to block.`,
            seats: challengers,
            anchor: block.blocker,
            optionForSeat: () => [this.createChoice('challenge', 'Challenge', { kind: 'challenge' })],
            resolve: selected => {
                if (!selected) {
                    block.historyEntry.result = 'resolved'
                    block.action.historyEntry.result = 'blocked'
                    return this.advanceTurn()
                }
                block.historyEntry.result = 'challenged'
                this.addHistory({
                    type: 'block_challenge', actorSeat: selected.seat, targetSeat: block.blocker,
                    action: block.action.type, claimRole: String(block.role).toLowerCase(), result: 'challenged'
                })
                this.addLog(`${this.players[selected.seat].name} challenged ${this.players[block.blocker].name}'s block.`)
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
                        this.loseInfluence(selected.seat, () => this.advanceTurn())
                    },
                    onConceded: () => this.loseInfluence(block.blocker, () => this.resolveAction(block.action))
                })
            }
        })
    }

    openProofDecision({ claimant, challenger, roles, historyEntry, description, onProved, onConceded }) {
        const player = this.players[claimant]
        const heldRoles = player.influences.filter(card => roles.includes(card))
        const choices = heldRoles.map((card, index) => this.createChoice(
            `prove:${card}:${index}`,
            `Show ${card}`,
            { kind: 'prove', card }
        ))
        choices.push(this.createChoice('concede', 'Do not prove; lose influence', { kind: 'concede' }))
        this.openDecision({
            type: 'prove_claim',
            title: 'Prove or concede',
            description,
            seats: [claimant],
            optionsFor: () => choices,
            resolve: responses => {
                const response = responses[0]
                if (!response) return this.pause('Claimant did not resolve the challenge.')
                if (response.choice.value.kind === 'prove') {
                    const provenCard = response.choice.value.card
                    if (historyEntry) historyEntry.result = 'proved'
                    this.addLog(`${player.name} proved the claim with ${provenCard}.`)
                    this.returnProvenInfluence(claimant, provenCard)
                    this.updatePlayers()
                    onProved()
                } else {
                    if (historyEntry) historyEntry.result = 'failed'
                    this.addLog(`${player.name} could not prove the claim.`)
                    onConceded()
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
        const player = this.players[seat]
        if (!player || player.isDead || player.influences.length === 0) {
            this.checkEliminated()
            this.updatePlayers()
            return onLost()
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
            resolve: responses => {
                const response = responses[0]
                if (!response) return this.pause('Influence loss was not resolved.')
                const cardIndex = this.players[seat].influences.indexOf(response.choice.value.card)
                if (cardIndex < 0) return this.pause('Influence changed during a loss decision.')
                const [card] = this.players[seat].influences.splice(cardIndex, 1)
                player.revealedInfluences.push(card)
                this.addLog(`${player.name} lost ${card}.`)
                this.checkEliminated()
                this.addHistory({
                    type: 'influence_loss', actorSeat: seat, revealedRole: String(card).toLowerCase(),
                    result: player.isDead ? 'eliminated' : 'resolved'
                })
                this.updatePlayers()
                onLost()
            }
        })
    }

    checkEliminated() {
        this.players.forEach(player => {
            if (!player.isDead && player.influences.length === 0) {
                player.isDead = true
                player.money = 0
                this.addLog(`${player.name} is out.`)
            }
        })
    }

    resolveAction(action) {
        if (this.phase !== 'running') return
        const actor = this.players[action.actor]
        const target = action.target == null ? null : this.players[action.target]
        if (action.type === 'income') actor.money += 1
        else if (action.type === 'foreign_aid') actor.money += 2
        else if (action.type === 'tax') actor.money += 3
        else if (action.type === 'steal' && target && !target.isDead) {
            const amount = Math.min(2, target.money)
            target.money -= amount
            actor.money += amount
        } else if ((action.type === 'coup' || action.type === 'assassinate') && target && !target.isDead) {
            action.historyEntry.result = 'resolved'
            return this.loseInfluence(action.target, () => this.advanceTurn())
        } else if (action.type === 'exchange') {
            action.historyEntry.result = 'resolved'
            const drawn = [this.deck.pop(), this.deck.pop()].filter(Boolean)
            return this.openExchange(action.actor, drawn)
        }
        if (action.historyEntry.result !== 'blocked') action.historyEntry.result = 'resolved'
        this.updatePlayers()
        this.advanceTurn()
    }

    openExchange(seat, drawn) {
        const player = this.players[seat]
        const pool = player.influences.concat(drawn)
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
        const options = combinations.map((keptIndices, index) => {
            const kept = keptIndices.map(poolIndex => pool[poolIndex])
            const label = `Keep ${kept.join(' and ')}`
            return this.createChoice(`exchange:${index}`, label, { kind: 'exchange', keptIndices, keep: kept })
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
                this.updatePlayers()
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
        this.playTurn()
        return true
    }
}

module.exports = CoupGame
