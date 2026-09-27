const test = require('node:test')
const assert = require('node:assert/strict')
const CoupGame = require('../game/coup')
const protocol = require('../ai/codex-protocol')

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

function makeGame({ timeoutMs = 1000, playerCount = 2, rng = () => 0, leaderSocketID } = {}) {
    const sockets = Array.from({ length: playerCount }, (_, index) => new FakeSocket(`socket-${index}`))
    const namespace = new FakeNamespace(sockets)
    const roster = sockets.map((socket, index) => ({ name: `Player ${index}`, socketID: socket.id }))
    const game = new CoupGame(roster, namespace, { rng, decisionTimeoutMs: timeoutMs, leaderSocketID })
    assert.equal(game.start(), true)
    return { game, namespace, sockets }
}

test('private projection and an authoritative action complete one turn', () => {
    const { game, sockets } = makeGame()
    const [first, second] = sockets
    const firstUpdate = first.last('g-updatePlayers').payload
    const secondUpdate = second.last('g-updatePlayers').payload
    const firstDecision = first.last('g-decision').payload

    assert.equal(firstDecision.type, 'action')
    assert.equal(second.last('g-decision'), undefined)
    assert.deepEqual(firstUpdate.ownInfluences, game.players[0].influences)
    assert.deepEqual(secondUpdate.ownInfluences, game.players[1].influences)
    assert.equal(JSON.stringify(firstUpdate).includes('socket-1'), false)
    assert.equal(JSON.stringify(firstUpdate.players[1]).includes('influences'), false)

    first.receive('g-submitDecision', {
        decisionId: firstDecision.decisionId,
        stateVersion: firstDecision.stateVersion,
        choiceId: 'income'
    })

    assert.equal(game.players[0].money, 2)
    assert.equal(game.currentPlayer, 1)
    assert.equal(second.last('g-decision').payload.type, 'action')
    assert.equal(game.phase, 'running')
})

test('decision envelopes bind the authorized socket, phase, version, and server choice', () => {
    const { game, sockets } = makeGame()
    const [active, other] = sockets
    const decision = active.last('g-decision').payload
    const before = game.players.map(player => player.money)

    other.receive('g-submitDecision', {
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId: 'income'
    })
    assert.equal(other.last('g-decisionRejected').payload.reason, 'This seat is not eligible for this decision.')
    active.receive('g-submitDecision', {
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId: 'income',
        source: 'Player 1',
        amount: -100
    })
    assert.equal(active.last('g-decisionRejected').payload.reason, 'Expected decisionId, stateVersion, and choiceId only.')
    active.receive('g-submitDecision', {
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion - 1,
        choiceId: 'income'
    })

    assert.deepEqual(game.players.map(player => player.money), before)
    assert.equal(game.activeDecision.responses.size, 0)
    assert.equal(other.last('g-decisionRejected').payload.reason, 'This seat is not eligible for this decision.')
    assert.equal(active.last('g-decisionRejected').payload.reason, 'Decision is stale or belongs to another phase.')
})

test('simultaneous challenges resolve by clockwise seat order, independent of arrival order', () => {
    const { game, namespace, sockets } = makeGame({ playerCount: 3 })
    const [actor, clockwiseFirst, clockwiseSecond] = sockets
    const action = actor.last('g-decision').payload
    actor.receive('g-submitDecision', {
        decisionId: action.decisionId,
        stateVersion: action.stateVersion,
        choiceId: 'tax'
    })
    const firstWindow = clockwiseFirst.last('g-decision').payload
    const secondWindow = clockwiseSecond.last('g-decision').payload
    assert.equal(firstWindow.type, 'challenge')
    assert.equal(firstWindow.decisionId, secondWindow.decisionId)
    assert.equal(firstWindow.stateVersion, secondWindow.stateVersion)

    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    clockwiseSecond.receive('g-submitDecision', envelope(secondWindow, 'challenge'))
    clockwiseFirst.receive('g-submitDecision', envelope(firstWindow, 'challenge'))

    const messages = namespace.outgoing.filter(item => item.event === 'g-addLog').map(item => item.payload)
    assert.ok(messages.includes('Player 1 challenged Player 0.'))
    assert.equal(messages.includes('Player 2 challenged Player 0.'), false)
    assert.equal(game.activeDecision.type, 'prove_claim')
})

test('simultaneous block declarations use the same fixed seat priority', () => {
    const { game, namespace, sockets } = makeGame({ playerCount: 3 })
    const [actor, clockwiseFirst, clockwiseSecond] = sockets
    const action = actor.last('g-decision').payload
    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    actor.receive('g-submitDecision', envelope(action, 'foreign_aid'))
    const firstWindow = clockwiseFirst.last('g-decision').payload
    const secondWindow = clockwiseSecond.last('g-decision').payload
    assert.equal(firstWindow.type, 'block')
    assert.equal(firstWindow.decisionId, secondWindow.decisionId)

    clockwiseSecond.receive('g-submitDecision', envelope(secondWindow, 'block:duke'))
    clockwiseFirst.receive('g-submitDecision', envelope(firstWindow, 'block:duke'))
    const messages = namespace.outgoing.filter(item => item.event === 'g-addLog').map(item => item.payload)
    assert.ok(messages.includes('Player 1 declared a block with duke.'))
    assert.equal(messages.includes('Player 2 declared a block with duke.'), false)
    assert.equal(game.activeDecision.type, 'block_challenge')
})

test('a seat response is idempotent, while a conflicting repeat is rejected', () => {
    const { game, sockets } = makeGame({ playerCount: 3 })
    const [actor, first, second] = sockets
    const action = actor.last('g-decision').payload
    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    actor.receive('g-submitDecision', envelope(action, 'tax'))
    const window = first.last('g-decision').payload
    const firstPass = envelope(window, 'pass')
    first.receive('g-submitDecision', firstPass)
    const responseCount = game.activeDecision.responses.size
    first.receive('g-submitDecision', firstPass)
    assert.equal(game.activeDecision.responses.size, responseCount)

    first.receive('g-submitDecision', envelope(window, 'challenge'))
    assert.equal(first.last('g-decisionRejected').payload.reason, 'A different choice was already submitted.')
    second.receive('g-submitDecision', envelope(window, 'pass'))
    assert.equal(game.players[0].money, 5)
})

test('the server charges assassination and keeps the lost target influence out of the deck', () => {
    const { game, sockets } = makeGame()
    const [actor, target] = sockets
    game.clearDecisionTimer()
    game.activeDecision = null
    game.players[0].money = 5
    game.playTurn()
    const deckBefore = game.deck.slice()
    const action = actor.last('g-decision').payload
    assert.ok(action.options.some(option => option.choiceId === 'assassinate:1'))

    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    actor.receive('g-submitDecision', envelope(action, 'assassinate:1'))
    assert.equal(game.players[0].money, 2)
    let response = target.last('g-decision').payload
    assert.equal(response.type, 'challenge')
    target.receive('g-submitDecision', envelope(response, 'pass'))
    response = target.last('g-decision').payload
    assert.equal(response.type, 'block')
    target.receive('g-submitDecision', envelope(response, 'pass'))
    response = target.last('g-decision').payload
    assert.equal(response.type, 'lose_influence')
    target.receive('g-submitDecision', envelope(response, 'lose:0'))

    assert.deepEqual(game.deck, deckBefore)
    assert.equal(game.players[1].revealedInfluences.length, 1)
    assert.equal(game.players[1].influences.length, 1)
    assert.equal(game.players[0].money, 2)
})

test('a target who loses an Assassin challenge takes the assassination loss without a block window', () => {
    const { game, sockets } = makeGame()
    const [actor, target] = sockets
    game.clearDecisionTimer()
    game.activeDecision = null
    game.players[0].money = 5
    game.players[0].influences = ['assassin', 'duke']
    game.players[1].influences = ['duke', 'contessa']
    game.playTurn()

    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    let decision = actor.last('g-decision').payload
    actor.receive('g-submitDecision', envelope(decision, 'assassinate:1'))
    decision = target.last('g-decision').payload
    assert.equal(decision.type, 'challenge')
    target.receive('g-submitDecision', envelope(decision, 'challenge'))

    decision = actor.last('g-decision').payload
    assert.equal(decision.type, 'prove_claim')
    actor.receive('g-submitDecision', envelope(decision, 'prove:assassin:0'))

    decision = target.last('g-decision').payload
    assert.equal(decision.type, 'lose_influence')
    target.receive('g-submitDecision', envelope(decision, 'lose:0'))

    assert.deepEqual(game.players[1].revealedInfluences, ['duke'])
    assert.deepEqual(game.players[1].influences, ['contessa'])
    decision = target.last('g-decision').payload
    assert.equal(decision.type, 'lose_influence')
    assert.deepEqual(decision.options.map(option => option.label), ['Reveal and lose contessa'])
    assert.equal(target.outgoing.filter(item => item.event === 'g-decision' && item.payload.type === 'block').length, 0)

    const deckAfterProof = game.deck.slice()
    target.receive('g-submitDecision', envelope(decision, 'lose:0'))
    assert.deepEqual(game.players[1].revealedInfluences, ['duke', 'contessa'])
    assert.deepEqual(game.deck, deckAfterProof)
    assert.equal(game.phase, 'gameover')
})

test('Exchange with one influence keeps one card and returns the rest to the Court deck', () => {
    const { game, sockets } = makeGame()
    const [actor] = sockets
    game.clearDecisionTimer()
    game.activeDecision = null
    game.deck = []
    game.players[0].influences = ['duke']
    game.openExchange(0, ['captain', 'ambassador'])

    const decision = actor.last('g-decision').payload
    assert.equal(decision.type, 'exchange')
    assert.equal(decision.title, 'Choose one influence to keep')
    assert.equal(decision.options.length, 3)
    assert.deepEqual(decision.options.map(option => option.label), [
        'Keep duke',
        'Keep captain',
        'Keep ambassador'
    ])
    actor.receive('g-submitDecision', {
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId: 'exchange:1'
    })

    assert.deepEqual(game.players[0].influences, ['captain'])
    assert.equal(game.players[0].influences.length, 1)
    assert.deepEqual(game.deck.slice().sort(), ['ambassador', 'duke'])
})

test('the explicitly supplied lobby leader alone may restart and the prior winner starts', () => {
    const { game, sockets } = makeGame({ leaderSocketID: 'socket-1' })
    game.previousWinner = 0
    game.phase = 'gameover'

    assert.equal(game.playAgain(sockets[0].id), false)
    assert.equal(sockets[0].last('g-decisionRejected').payload.reason, 'Only the current lobby leader can restart after game over.')
    assert.equal(game.playAgain(sockets[1].id), true)
    assert.equal(game.currentPlayer, 0)
    assert.equal(game.players[0].money, 1)
    assert.equal(game.players[1].money, 2)
})

test('an incomplete shared window times out by pausing without defaulting unanswered seats', async () => {
    const { game, namespace, sockets } = makeGame({ playerCount: 3, timeoutMs: 25 })
    const [actor, first, second] = sockets
    const action = actor.last('g-decision').payload
    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    actor.receive('g-submitDecision', envelope(action, 'tax'))
    const window = first.last('g-decision').payload
    const moneyBefore = game.players[0].money
    first.receive('g-submitDecision', envelope(window, 'pass'))
    await new Promise(resolve => setTimeout(resolve, 45))

    assert.equal(game.phase, 'paused')
    assert.equal(game.players[0].money, moneyBefore)
    assert.match(namespace.outgoing.find(item => item.event === 'g-gamePaused').payload.cause, /timed out/)
    assert.equal(namespace.outgoing.find(item => item.event === 'g-gamePaused').payload.canResume, true)
    second.receive('g-submitDecision', envelope(window, 'challenge'))
    assert.equal(second.last('g-decisionRejected').payload.reason, 'There is no active decision.')
})

test('only the leader resumes a timed-out decision, with a fresh id and empty response set', async () => {
    const { game, sockets } = makeGame({ playerCount: 3, timeoutMs: 25 })
    const [leader, first, second] = sockets
    const action = leader.last('g-decision').payload
    const envelope = (decision, choiceId) => ({
        decisionId: decision.decisionId,
        stateVersion: decision.stateVersion,
        choiceId
    })
    leader.receive('g-submitDecision', envelope(action, 'tax'))
    const oldWindow = first.last('g-decision').payload
    first.receive('g-submitDecision', envelope(oldWindow, 'pass'))
    await new Promise(resolve => setTimeout(resolve, 45))
    assert.equal(game.phase, 'paused')

    first.receive('g-resume')
    assert.equal(first.last('g-decisionRejected').payload.reason, 'Only the lobby leader can resume a timed-out decision.')
    leader.receive('g-resume')
    const newWindow = first.last('g-decision').payload
    assert.equal(game.phase, 'running')
    assert.notEqual(newWindow.decisionId, oldWindow.decisionId)
    assert.notEqual(newWindow.stateVersion, oldWindow.stateVersion)
    assert.equal(game.activeDecision.responses.size, 0)

    second.receive('g-submitDecision', envelope(oldWindow, 'challenge'))
    assert.equal(second.last('g-decisionRejected').payload.reason, 'Decision is stale or belongs to another phase.')
    first.receive('g-submitDecision', envelope(newWindow, 'pass'))
    second.receive('g-submitDecision', envelope(second.last('g-decision').payload, 'pass'))
    assert.equal(game.players[0].money, 5)
})

test('a seat disconnecting during a timeout pause makes that pause non-resumable', async () => {
    const { game, namespace, sockets } = makeGame({ playerCount: 3, timeoutMs: 20 })
    const [leader, first] = sockets
    const action = leader.last('g-decision').payload
    leader.receive('g-submitDecision', {
        decisionId: action.decisionId,
        stateVersion: action.stateVersion,
        choiceId: 'tax'
    })
    const originalDecisionId = first.last('g-decision').payload.decisionId
    await new Promise(resolve => setTimeout(resolve, 35))
    delete namespace.sockets[sockets[2].id]
    sockets[2].receive('disconnect')

    assert.equal(namespace.outgoing.filter(item => item.event === 'g-gamePaused').slice(-1)[0].payload.canResume, false)
    leader.receive('g-resume')
    assert.equal(leader.last('g-decisionRejected').payload.reason, 'This pause cannot be resumed; recreate the game.')
    assert.equal(game.phase, 'paused')
    assert.equal(first.last('g-decision').payload.decisionId, originalDecisionId)
})

test('two-player setup uses a random first seat, 1/2 starting coins, and the prior winner on replay', () => {
    const { game } = makeGame({ rng: () => 0.99 })
    assert.equal(game.currentPlayer, 1)
    assert.deepEqual(game.players.map(player => player.money), [2, 1])

    game.previousWinner = 0
    game.resetGame()
    assert.equal(game.currentPlayer, 0)
    assert.deepEqual(game.players.map(player => player.money), [1, 2])
})

test('lost influence stays outside the Court deck while a proven claim returns and replaces its card', () => {
    const { game, sockets } = makeGame()
    const deckBeforeLoss = game.deck.slice()
    game.players[1].influences = ['duke']
    let lossContinuation = false
    game.loseInfluence(1, () => { lossContinuation = true })
    const lossDecision = sockets[1].last('g-decision').payload
    sockets[1].receive('g-submitDecision', {
        decisionId: lossDecision.decisionId,
        stateVersion: lossDecision.stateVersion,
        choiceId: 'lose:0'
    })

    assert.deepEqual(game.deck, deckBeforeLoss)
    assert.deepEqual(game.players[1].revealedInfluences, ['duke'])
    assert.equal(game.players[1].isDead, true)
    assert.equal(lossContinuation, true)

    game.players[0].influences = ['duke', 'captain']
    game.deck = ['ambassador']
    const challengerDecisionCount = sockets[1].outgoing.filter(item => item.event === 'g-decision').length
    let proved = false
    game.openProofDecision({
        claimant: 0,
        challenger: 1,
        roles: ['duke'],
        description: 'Prove Duke.',
        onProved: () => { proved = true },
        onConceded: () => assert.fail('Expected a proof to resolve.')
    })
    const proofDecision = sockets[0].last('g-decision').payload
    assert.equal(sockets[1].outgoing.filter(item => item.event === 'g-decision').length, challengerDecisionCount)
    sockets[0].receive('g-submitDecision', {
        decisionId: proofDecision.decisionId,
        stateVersion: proofDecision.stateVersion,
        choiceId: 'prove:duke:0'
    })

    assert.equal(proved, true)
    assert.equal(game.players[0].influences.length, 2)
    assert.ok(game.players[0].influences.includes('ambassador'))
    assert.deepEqual(game.deck, ['duke'])
})

test('a Codex seat acts through the same legal choices and receives only its hand plus public history', async () => {
    const human = new FakeSocket('human-socket')
    const namespace = new FakeNamespace([human])
    const inputs = []
    let resolveCalled
    const called = new Promise(resolve => { resolveCalled = resolve })
    const codexClient = {
        choose(input) {
            inputs.push(input)
            resolveCalled()
            return Promise.resolve({
                decisionId: input.decisionId,
                stateVersion: input.stateVersion,
                rulesVersion: protocol.RULESET_VERSION,
                choiceId: input.observation.options[0].choiceId
            })
        }
    }
    const game = new CoupGame([
        { name: 'Human', socketID: human.id, controller: 'human' },
        { name: 'Codex 1', controller: 'codex', effort: 'medium' }
    ], namespace, { rng: () => 0, codexClient, decisionTimeoutMs: 1000, leaderSocketID: human.id })
    assert.equal(game.start(), true)
    const firstAction = human.last('g-decision').payload
    human.receive('g-submitDecision', {
        decisionId: firstAction.decisionId, stateVersion: firstAction.stateVersion, choiceId: 'income'
    })
    await called
    await new Promise(resolve => setImmediate(resolve))

    assert.equal(game.players[1].money, 3)
    assert.equal(game.currentPlayer, 0)
    assert.equal(game.activeDecision.type, 'action')
    const input = inputs[0]
    assert.equal(input.effort, 'medium')
    assert.deepEqual(input.observation.ownInfluences, game.players[1].influences)
    assert.deepEqual(input.observation.publicState.players.map(player => player.influenceCount), [2, 2])
    assert.equal('influences' in input.observation.publicState.players[0], false)
    assert.equal(JSON.stringify(input).includes('human-socket'), false)
    assert.ok(input.observation.history.some(event => event.type === 'action' && event.actorSeat === 0 && event.action === 'income'))
    assert.doesNotThrow(() => protocol.normalizeRequest({
        requestId: 'test-request', decisionId: input.decisionId, stateVersion: input.stateVersion,
        effort: input.effort, observation: input.observation
    }))
    assert.equal(human.last('g-decision').payload.type, 'action')
    game.pause('test cleanup')
})

test('emergency Codex shutdown aborts an AI challenge and pauses without applying its answer', async () => {
    const human = new FakeSocket('human-socket')
    const namespace = new FakeNamespace([human])
    let resolveCalled
    const called = new Promise(resolve => { resolveCalled = resolve })
    let wasAborted = false
    const codexClient = {
        choose(input) {
            resolveCalled(input)
            return new Promise((_resolve, reject) => {
                input.signal.addEventListener('abort', () => {
                    wasAborted = true
                    reject(input.signal.reason)
                }, { once: true })
            })
        }
    }
    const game = new CoupGame([
        { name: 'Human', socketID: human.id, controller: 'human' },
        { name: 'Codex 1', controller: 'codex', effort: 'high' }
    ], namespace, { rng: () => 0, codexClient, decisionTimeoutMs: 1000, leaderSocketID: human.id })
    game.start()
    const action = human.last('g-decision').payload
    human.receive('g-submitDecision', {
        decisionId: action.decisionId, stateVersion: action.stateVersion, choiceId: 'tax'
    })
    const input = await called

    assert.equal(game.activeDecision.type, 'challenge')
    assert.deepEqual(input.observation.options.map(option => option.choiceId), ['pass', 'challenge'])
    assert.ok(input.observation.history.some(event => event.type === 'claim' && event.claimRole === 'duke'))
    const moneyBefore = game.players.map(player => player.money)
    game.disableCodex()
    await new Promise(resolve => setImmediate(resolve))

    assert.equal(wasAborted, true)
    assert.equal(game.phase, 'paused')
    assert.deepEqual(game.players.map(player => player.money), moneyBefore)
    assert.match(namespace.outgoing.find(item => item.event === 'g-gamePaused').payload.cause, /disabled by a player/)
})

test('AI-versus-AI can be watched without sending either hidden hand to the spectator', async () => {
    const spectator = new FakeSocket('spectator-socket')
    const namespace = new FakeNamespace([spectator])
    let resolveCalled
    const called = new Promise(resolve => { resolveCalled = resolve })
    const codexClient = {
        choose(input) {
            resolveCalled()
            return new Promise((_resolve, reject) => {
                input.signal.addEventListener('abort', () => reject(input.signal.reason), { once: true })
            })
        }
    }
    const game = new CoupGame([
        { name: 'Codex 1', controller: 'codex', effort: 'low' },
        { name: 'Codex 2', controller: 'codex', effort: 'high' }
    ], namespace, {
        rng: () => 0, codexClient, decisionTimeoutMs: 1000,
        leaderSocketID: spectator.id, spectatorSocketIDs: [spectator.id]
    })
    assert.equal(game.start(), true)
    await called
    const update = spectator.last('g-updatePlayers').payload
    assert.equal(update.spectator, true)
    assert.deepEqual(update.ownInfluences, [])
    assert.equal(update.players.every(player => !Object.prototype.hasOwnProperty.call(player, 'influences')), true)
    assert.equal(spectator.last('g-decision'), undefined)
    game.disableCodex()
    assert.equal(game.phase, 'paused')
})
