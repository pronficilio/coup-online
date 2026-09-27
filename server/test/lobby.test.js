const test = require('node:test')
const assert = require('node:assert/strict')
const { openLobby } = require('../game/lobby')

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

    emit(event, payload) {
        this.send(event, payload)
    }

    last(event) {
        return this.outgoing.filter(item => item.event === event).slice(-1)[0]
    }
}

class FakeNamespace {
    constructor() {
        this.sockets = {}
        this.handlers = new Map()
        this.outgoing = []
    }

    on(event, callback) {
        this.handlers.set(event, callback)
    }

    connect(socket) {
        this.sockets[socket.id] = socket
        this.handlers.get('connection')(socket)
    }

    emit(event, payload) {
        this.outgoing.push({ event, payload })
        Object.values(this.sockets).forEach(socket => socket.send(event, payload))
    }

    to(socketID) {
        return { emit: (event, payload) => this.sockets[socketID]?.send(event, payload) }
    }
}

test('lobby authorizes the first named socket and builds its roster without client identity', async () => {
    const namespace = new FakeNamespace()
    let started = null
    let startCalled = false
    openLobby(namespace, '/ROOM', {
        startGame(roster, leaderSocketID) {
            started = { roster, leaderSocketID }
            return { start() { startCalled = true } }
        },
        cleanup() {}
    })
    const connectedFirst = new FakeSocket('socket-first')
    const namedFirst = new FakeSocket('socket-leader')
    namespace.connect(connectedFirst)
    namespace.connect(namedFirst)

    namedFirst.receive('setName', 'Leader')
    connectedFirst.receive('setName', 'Second')
    connectedFirst.receive('startGameSignal', [{ name: 'Injected', socketID: 'attacker' }])
    assert.equal(connectedFirst.last('startRejected').payload, 'leader_only')
    connectedFirst.receive('setReady', true)
    namedFirst.receive('startGameSignal', [{ name: 'Injected', socketID: 'attacker' }])

    assert.deepEqual(started, {
        roster: [
            { name: 'Second', socketID: 'socket-first', controller: 'human' },
            { name: 'Leader', socketID: 'socket-leader', controller: 'human' }
        ],
        leaderSocketID: 'socket-leader'
    })
    assert.equal(namedFirst.last('leader').payload, true)
    assert.equal(JSON.stringify(namedFirst.last('partyUpdate').payload).includes('socketID'), false)
    assert.equal(namespace.outgoing.some(item => item.event === 'startGame'), true)
    await new Promise(resolve => setTimeout(resolve, 60))
    assert.equal(startCalled, true)
})

test('only the leader with the shared code can add configured Codex seats', () => {
    const namespace = new FakeNamespace()
    let started = null
    const lobby = openLobby(namespace, '/ROOM', {
        aiAccessCode: 'test-shared-code-long-enough',
        startGame(roster, leaderSocketID, spectatorSocketIDs) {
            started = { roster, leaderSocketID, spectatorSocketIDs }
            return { start() {} }
        },
        cleanup() {}
    })
    const leader = new FakeSocket('leader')
    const friend = new FakeSocket('friend')
    namespace.connect(leader)
    namespace.connect(friend)
    leader.receive('setName', 'Host')
    friend.receive('setName', 'Friend')
    friend.receive('setReady', true)

    friend.receive('authorizeCodexAI', { code: 'test-shared-code-long-enough' })
    friend.receive('addCodexSeat', { effort: 'high' })
    leader.receive('addCodexSeat', { effort: 'invalid' })
    assert.equal(friend.last('codexAuthorizationResult').payload.authorized, false)
    assert.equal(lobby.started, false)

    leader.receive('authorizeCodexAI', { code: 'wrong' })
    assert.equal(leader.last('codexAuthorizationResult').payload.authorized, false)
    leader.receive('authorizeCodexAI', { code: 'test-shared-code-long-enough' })
    leader.receive('addCodexSeat', { effort: 'low' })
    leader.receive('addCodexSeat', { effort: 'high' })
    assert.deepEqual(leader.last('partyUpdate').payload.slice(-2).map(player => [player.kind, player.effort]), [
        ['codex', 'low'], ['codex', 'high']
    ])
    assert.equal(JSON.stringify(leader.last('partyUpdate').payload).includes('test-shared-code'), false)

    leader.receive('startGameSignal')
    assert.equal(lobby.started, true)
    assert.deepEqual(started, {
        roster: [
            { name: 'Host', socketID: 'leader', controller: 'human' },
            { name: 'Friend', socketID: 'friend', controller: 'human' },
            { name: 'Codex 1', controller: 'codex', effort: 'low' },
            { name: 'Codex 2', controller: 'codex', effort: 'high' }
        ],
        leaderSocketID: 'leader',
        spectatorSocketIDs: []
    })
})

test('only the code-authorized lobby leader can trigger emergency stop', async () => {
    const namespace = new FakeNamespace()
    let started = null
    const stopped = []
    const lobby = openLobby(namespace, '/ROOM', {
        aiAccessCode: 'test-shared-code-long-enough',
        onEmergencyStop: socketID => stopped.push(socketID),
        startGame(roster, leaderSocketID, spectatorSocketIDs) {
            started = { roster, leaderSocketID, spectatorSocketIDs }
            return { start() {} }
        },
        cleanup() {}
    })
    const host = new FakeSocket('host')
    const friend = new FakeSocket('friend')
    namespace.connect(host)
    namespace.connect(friend)
    host.receive('setName', 'Watcher')
    host.receive('emergencyStopCodex')
    assert.deepEqual(stopped, [])
    friend.receive('emergencyStopCodex')
    assert.deepEqual(stopped, [])

    host.receive('authorizeCodexAI', { code: 'test-shared-code-long-enough' })
    host.receive('addCodexSeat', { effort: 'medium' })
    host.receive('addCodexSeat', { effort: 'low' })
    host.receive('setParticipating', false)
    host.receive('startGameSignal')

    assert.equal(lobby.started, true)
    assert.deepEqual(started, {
        roster: [
            { name: 'Codex 1', controller: 'codex', effort: 'medium' },
            { name: 'Codex 2', controller: 'codex', effort: 'low' }
        ],
        leaderSocketID: 'host',
        spectatorSocketIDs: ['host']
    })
    friend.receive('emergencyStopCodex')
    assert.deepEqual(stopped, [])
    host.receive('emergencyStopCodex')
    assert.deepEqual(stopped, ['host'])
})

test('Codex seats are rejected at game start when the AI code was not configured', () => {
    const namespace = new FakeNamespace()
    let startCalls = 0
    openLobby(namespace, '/ROOM', {
        aiAccessCode: '',
        startGame() { startCalls += 1; return { start() {} } },
        cleanup() {}
    })
    const host = new FakeSocket('host')
    namespace.connect(host)
    host.receive('setName', 'Host')
    host.receive('startGameSignal')
    assert.equal(host.last('codexAvailable').payload.available, false)
    assert.equal(startCalls, 0)
})
