const test = require('node:test')
const assert = require('node:assert/strict')
const CoupGame = require('../game/coup')

class FakeSocket {
    constructor(id) {
        this.id = id
        this.handlers = new Map()
        this.outgoing = []
    }

    on(event, callback) {
        const listeners = this.handlers.get(event) || []
        listeners.push(callback)
        this.handlers.set(event, listeners)
    }

    receive(event, payload) {
        for (const listener of this.handlers.get(event) || []) listener(payload)
    }

    send(event, payload) {
        this.outgoing.push({ event, payload })
    }

    last(event) {
        return this.outgoing.filter(item => item.event === event).at(-1)
    }
}

class FakeNamespace {
    constructor(sockets) {
        this.sockets = Object.fromEntries(sockets.map(socket => [socket.id, socket]))
        this.outgoing = []
    }

    emit(event, payload) {
        this.outgoing.push({ event, payload })
        Object.values(this.sockets).forEach(socket => socket.send(event, payload))
    }

    to(socketID) {
        return { emit: (event, payload) => this.sockets[socketID]?.send(event, payload) }
    }
}

function makeGame({ playerCount = 2, spectatorCount = 0 } = {}) {
    const players = Array.from({ length: playerCount }, (_, index) => new FakeSocket(`player-${index}`))
    const spectators = Array.from({ length: spectatorCount }, (_, index) => new FakeSocket(`spectator-${index}`))
    const namespace = new FakeNamespace([...players, ...spectators])
    const roster = players.map((socket, index) => ({ name: `Player ${index}`, socketID: socket.id }))
    const game = new CoupGame(roster, namespace, {
        rng: () => 0,
        decisionTimeoutMs: 1000,
        leaderSocketID: players[0]?.id,
        spectatorSocketIDs: spectators.map(socket => socket.id)
    })
    assert.equal(game.start(), true)
    return { game, namespace, players, spectators }
}

function choose(socket, choiceId) {
    const decision = socket.last('g-decision')?.payload
    assert.ok(decision, `expected a decision for ${socket.id}`)
    socket.receive('g-submitDecision', {
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
}

function eventOf(game, type, predicate = () => true) {
    const event = game.publicLogEvents.find(candidate => candidate.type === type && predicate(candidate))
    assert.ok(event, `expected ${type} event`)
    return event
}

function react(socket, event, reaction, requestId) {
    socket.receive('g-reactToEvent', { eventId: event.id, reaction, requestId })
}

test('public events have stable typed envelopes, per-match IDs, turns, and real income results', () => {
    const { game, players } = makeGame()
    const firstMatchId = game.matchID
    choose(players[0], 'income')

    const declared = eventOf(game, 'action_declared')
    const result = eventOf(game, 'action_result')
    assert.deepEqual(Object.keys(declared).sort(), ['data', 'id', 'reactions', 'translation', 'turn', 'type'])
    assert.equal(declared.id, `${firstMatchId}-event-1`)
    assert.equal(result.id, `${firstMatchId}-event-2`)
    assert.notEqual(declared.id, result.id)
    assert.equal(declared.turn, 1)
    assert.deepEqual(declared.data, { actorSeat: 0, action: 'income' })
    assert.deepEqual(declared.translation, { key: 'game.log.actionUsed', params: {} })
    assert.deepEqual(result.data, { actorSeat: 0, action: 'income', result: 'resolved', amount: 1 })
    assert.equal(result.translation.key, 'game.log.actionResult')
    assert.ok(!Object.hasOwn(declared, 'timestamp'))
})

test('reaction requests reject malformed payloads, unknown events, and disallowed reactions', () => {
    const { game, players } = makeGame()
    choose(players[0], 'income')
    const event = eventOf(game, 'action_result')

    players[0].receive('g-reactToEvent', null)
    assert.equal(players[0].last('g-reactionRejected').payload.reason, 'invalid_payload')
    players[0].receive('g-reactToEvent', {
        eventId: event.id, reaction: 'like', requestId: 'extra-field', seat: 1
    })
    assert.equal(players[0].last('g-reactionRejected').payload.reason, 'invalid_payload')
    react(players[0], { id: 'unknown-event' }, 'like', 'unknown-event-request')
    assert.equal(players[0].last('g-reactionRejected').payload.reason, 'unknown_event')
    react(players[0], event, 'secret', 'wrong-catalog-request')
    assert.equal(players[0].last('g-reactionRejected').payload.reason, 'reaction_not_allowed')
    assert.equal(game.reactionsByEvent.size, 0)
})

test('one seat has one reaction per event; duplicate requests are idempotent and fresh clicks toggle', () => {
    const { game, namespace, players } = makeGame()
    choose(players[0], 'income')
    const event = eventOf(game, 'action_result')

    react(players[0], event, 'like', 'request-like')
    react(players[0], event, 'like', 'request-like')
    assert.deepEqual(namespace.outgoing.filter(item => item.event === 'g-reactionCounts').at(-1).payload.counts, { like: 1 })

    react(players[0], event, 'bravo', 'request-replace')
    assert.deepEqual(namespace.outgoing.filter(item => item.event === 'g-reactionCounts').at(-1).payload.counts, { bravo: 1 })
    react(players[0], event, 'bravo', 'request-replace')
    assert.deepEqual(namespace.outgoing.filter(item => item.event === 'g-reactionCounts').at(-1).payload.counts, { bravo: 1 })
    react(players[0], event, 'bravo', 'request-toggle-off')
    assert.deepEqual(namespace.outgoing.filter(item => item.event === 'g-reactionCounts').at(-1).payload.counts, {})
    assert.equal(players[0].last('g-reactionOwn').payload.reaction, null)
    assert.deepEqual(namespace.outgoing.filter(item => item.event === 'g-reactionPresence').map(item => item.payload), [
        { seat: 0, reaction: 'like' },
        { seat: 0, reaction: 'bravo' },
        { seat: 0, reaction: null }
    ])

    react(players[0], event, 'like', 'request-reuse')
    react(players[0], event, 'bravo', 'request-reuse')
    assert.equal(players[0].last('g-reactionRejected').payload.reason, 'duplicate_request_id')
    assert.equal(players[0].last('g-reactionOwn').payload.reaction, 'like')
    react(players[0], eventOf(game, 'action_declared'), 'like', 'request-reuse')
    assert.equal(players[0].last('g-reactionRejected').payload.reason, 'duplicate_request_id')
})

test('simultaneous seats produce exact aggregates without public seat-to-reaction mappings', () => {
    const { game, namespace, players, spectators } = makeGame({ spectatorCount: 1 })
    choose(players[0], 'income')
    const event = eventOf(game, 'action_result')

    players[0].receive('g-reactToEvent', { eventId: event.id, reaction: 'like', requestId: 'p0-like' })
    players[1].receive('g-reactToEvent', { eventId: event.id, reaction: 'like', requestId: 'p1-like' })
    const aggregate = namespace.outgoing.filter(item => item.event === 'g-reactionCounts').at(-1).payload
    assert.deepEqual(aggregate, { eventId: event.id, counts: { like: 2 } })
    assert.equal(JSON.stringify(aggregate).includes('seat'), false)
    assert.equal(JSON.stringify(aggregate).includes('player-'), false)
    assert.equal(players[0].last('g-reactionOwn').payload.reaction, 'like')
    assert.equal(players[1].last('g-reactionOwn').payload.reaction, 'like')
    assert.equal(spectators[0].last('g-reactionOwn'), undefined)
    assert.deepEqual(namespace.outgoing.filter(item => item.event === 'g-reactionPresence').map(item => item.payload), [
        { seat: 0, reaction: 'like' },
        { seat: 1, reaction: 'like' }
    ])
    assert.equal(namespace.outgoing.filter(item => item.event === 'g-reactionPresence')
        .every(item => !Object.hasOwn(item.payload, 'eventId')), true)

    spectators[0].receive('g-reactToEvent', { eventId: event.id, reaction: 'like', requestId: 'spectator-like' })
    assert.equal(spectators[0].last('g-reactionRejected').payload.reason, 'ineligible_actor')
    assert.deepEqual(game.reactionCounts(event.id), { like: 2 })
})

test('context catalog excludes laughter for lost influence and elimination', () => {
    const { game, players } = makeGame()
    game.players[1].influences = ['duke']
    game.loseInfluence(1, () => {})
    const decision = players[1].last('g-decision').payload
    players[1].receive('g-submitDecision', {
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId: 'lose:0'
    })

    const loss = eventOf(game, 'influence_lost')
    const eliminated = eventOf(game, 'player_eliminated')
    assert.deepEqual(loss.reactions, ['surprise', 'dislike', 'thinking'])
    assert.deepEqual(eliminated.reactions, ['surprise', 'dislike', 'thinking'])
    assert.equal(loss.reactions.includes('laugh'), false)
    assert.equal(eliminated.reactions.includes('laugh'), false)
})

test('every public event context receives its approved reaction catalog', () => {
    const { game } = makeGame()
    const contexts = [
        ['action_declared', { action: 'income' }, ['like', 'bravo', 'laugh', 'skeptical']],
        ['action_declared', { action: 'coup' }, ['surprise', 'thinking', 'dislike', 'secret']],
        ['action_declared', { action: 'exchange' }, ['thinking', 'secret', 'like']],
        ['action_result', { action: 'foreign_aid', result: 'blocked' }, ['like', 'bravo', 'skeptical', 'surprise']],
        ['action_result', { action: 'steal', result: 'resolved', amount: 0 }, ['surprise', 'thinking', 'skeptical', 'dislike']],
        ['challenge_started', {}, ['thinking', 'skeptical', 'surprise', 'bravo']],
        ['block_challenge_started', {}, ['thinking', 'skeptical', 'surprise', 'bravo']],
        ['block_declared', {}, ['like', 'bravo', 'skeptical', 'surprise']],
        ['claim_proved', {}, ['bravo', 'surprise', 'secret', 'like']],
        ['claim_not_proved', {}, ['surprise', 'laugh', 'skeptical', 'dislike']],
        ['influence_lost', {}, ['surprise', 'dislike', 'thinking']],
        ['player_eliminated', {}, ['surprise', 'dislike', 'thinking']]
    ]

    for (const [type, data, reactions] of contexts) {
        const event = game.addLog(type, data, { key: `test.${type}` })
        assert.deepEqual(event.reactions, reactions, `${type} ${JSON.stringify(data)}`)
    }
})

test('Codex-controlled seats have no socket identity that can authorize a reaction', () => {
    const human = new FakeSocket('human-player')
    const namespace = new FakeNamespace([human])
    const game = new CoupGame([
        { name: 'Human', socketID: human.id },
        { name: 'Codex', controller: 'codex' }
    ], namespace, { rng: () => 0, decisionTimeoutMs: 1000, leaderSocketID: human.id })
    assert.equal(game.start(), true)
    choose(human, 'income')
    const event = eventOf(game, 'action_result')

    assert.equal(game.players[1].socketID, null)
    assert.equal(game.reactToEvent('codex:1', {
        eventId: event.id, reaction: 'like', requestId: 'codex-cannot-react'
    }), false)
    assert.equal(game.reactionsByEvent.size, 0)
})

test('action result entries report actual income, aid, tax, and blocked aid amounts', () => {
    {
        const { game, players } = makeGame()
        choose(players[0], 'foreign_aid')
        choose(players[1], 'pass')
        const result = eventOf(game, 'action_result')
        assert.deepEqual(result.data, { actorSeat: 0, action: 'foreign_aid', result: 'resolved', amount: 2 })
    }
    {
        const { game, players } = makeGame()
        choose(players[0], 'foreign_aid')
        choose(players[1], 'block:duke')
        choose(players[0], 'pass')
        const result = eventOf(game, 'action_result')
        assert.deepEqual(result.data, {
            actorSeat: 0, action: 'foreign_aid', result: 'blocked', blockerSeat: 1, amount: 0
        })
    }
    {
        const { game, players } = makeGame()
        choose(players[0], 'tax')
        choose(players[1], 'pass')
        const result = eventOf(game, 'action_result')
        assert.deepEqual(result.data, { actorSeat: 0, action: 'tax', result: 'resolved', amount: 3 })
    }
})

test('steal result uses the actual transferred amount for zero, one, and two coins', () => {
    for (const amount of [0, 1, 2]) {
        const { game, players } = makeGame()
        game.players[1].money = amount
        choose(players[0], 'steal:1')
        choose(players[1], 'pass')
        choose(players[1], 'pass')

        const result = eventOf(game, 'action_result')
        assert.deepEqual(result.data, {
            actorSeat: 0, action: 'steal', result: 'resolved', targetSeat: 1, amount
        })
        assert.equal(result.reactions.includes('like'), amount > 0)
    }
})

test('exchange completion log and snapshot never expose the private Court draw or kept cards', () => {
    const { game, players } = makeGame()
    const secrets = ['private-held-card', 'private-draw-a', 'private-draw-b']
    game.players[0].influences = [secrets[0]]
    game.deck = secrets.slice(1)
    choose(players[0], 'exchange')
    choose(players[1], 'pass')
    choose(players[0], 'exchange:0')

    const declared = eventOf(game, 'action_declared')
    const result = eventOf(game, 'action_result')
    assert.deepEqual(declared.data, { actorSeat: 0, action: 'exchange', claimRole: 'ambassador' })
    assert.deepEqual(result.data, { actorSeat: 0, action: 'exchange', result: 'resolved' })
    const snapshot = game.eventLogSnapshot(players[0].id)
    for (const secret of secrets) {
        assert.equal(JSON.stringify(snapshot).includes(secret), false)
    }
    assert.equal(JSON.stringify(snapshot).includes(players[0].id), false)
})

test('snapshots expose only aggregate counts and the requester’s own reaction; rematch clears state', () => {
    const { game, players, spectators } = makeGame({ spectatorCount: 1 })
    choose(players[0], 'income')
    const event = eventOf(game, 'action_result')
    react(players[0], event, 'like', 'snapshot-like')

    players[0].receive('g-requestEventLogState')
    const ownerSnapshot = players[0].last('g-eventLogState').payload
    assert.deepEqual(ownerSnapshot.ownReactions, [{ eventId: event.id, reaction: 'like' }])
    assert.deepEqual(ownerSnapshot.reactionCounts.find(item => item.eventId === event.id).counts, { like: 1 })

    spectators[0].receive('g-requestEventLogState')
    const spectatorSnapshot = spectators[0].last('g-eventLogState').payload
    assert.deepEqual(spectatorSnapshot.ownReactions, [])
    assert.deepEqual(spectatorSnapshot.reactionCounts.find(item => item.eventId === event.id).counts, { like: 1 })
    assert.equal(JSON.stringify(spectatorSnapshot).includes('player-0'), false)

    const previousMatchId = game.matchID
    game.phase = 'gameover'
    players[0].receive('g-playAgain')
    assert.notEqual(game.matchID, previousMatchId)
    assert.equal(game.publicLogEvents.length, 0)
    assert.equal(game.reactionsByEvent.size, 0)
    assert.equal(game.reactionRequestsBySeat.size, 0)
    assert.equal(game.reactionPresenceBySeat.size, 0)
    assert.deepEqual(players[0].last('g-eventLogState').payload.events, [])
    assert.deepEqual(players[0].last('g-eventLogState').payload.ownReactions, [])
})
