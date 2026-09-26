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
            { name: 'Second', socketID: 'socket-first' },
            { name: 'Leader', socketID: 'socket-leader' }
        ],
        leaderSocketID: 'socket-leader'
    })
    assert.equal(namedFirst.last('leader').payload, true)
    assert.equal(JSON.stringify(namedFirst.last('partyUpdate').payload).includes('socketID'), false)
    assert.equal(namespace.outgoing.some(item => item.event === 'startGame'), true)
    await new Promise(resolve => setTimeout(resolve, 60))
    assert.equal(startCalled, true)
})
