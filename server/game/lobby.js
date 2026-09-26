function openLobby(gameSocket, namespace, { startGame, cleanup }) {
    const seats = []
    let leaderSocketID = null
    let started = false

    const namedSeats = () => seats.filter(seat => seat.name)
    const emitPartyUpdate = () => {
        gameSocket.emit('partyUpdate', namedSeats().map(({ name, isReady }) => ({ name, isReady })))
    }
    const send = (socketID, event, payload) => gameSocket.to(socketID).emit(event, payload)
    const updateSeat = (socket, patch) => {
        const seat = seats.find(candidate => candidate.socketID === socket.id)
        if (seat) Object.assign(seat, patch)
        return seat
    }

    gameSocket.on('connection', socket => {
        if (started || seats.length >= 6) {
            socket.emit('joinFailed', started ? 'game_already_started' : 'party_full')
            socket.disconnect(true)
            return
        }
        const seat = { socketID: socket.id, name: '', isReady: false }
        seats.push(seat)

        socket.on('setName', value => {
            if (started) return send(socket.id, 'joinFailed', 'game_already_started')
            if (seat.name) return send(socket.id, 'joinFailed', 'name_already_set')
            const name = typeof value === 'string' ? value.trim() : ''
            if (!name || name.length > 10 || /[\u0000-\u001f\u007f]/.test(name)) {
                return send(socket.id, 'joinFailed', 'invalid_name')
            }
            if (namedSeats().some(other => other.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
                return send(socket.id, 'joinFailed', 'name_taken')
            }
            if (namedSeats().length >= 6) return send(socket.id, 'joinFailed', 'party_full')
            seat.name = name
            if (!leaderSocketID) {
                leaderSocketID = socket.id
                seat.isReady = true
                send(socket.id, 'leader', true)
            }
            emitPartyUpdate()
            send(socket.id, 'joinSuccess', true)
        })

        socket.on('setReady', isReady => {
            if (started || typeof isReady !== 'boolean' || !seat.name) return
            updateSeat(socket, { isReady })
            emitPartyUpdate()
            send(socket.id, 'readyConfirm', isReady)
        })

        socket.on('startGameSignal', () => {
            if (started) return send(socket.id, 'startRejected', 'game_already_started')
            if (socket.id !== leaderSocketID) return send(socket.id, 'startRejected', 'leader_only')
            const roster = namedSeats()
            if (roster.length < 2) return send(socket.id, 'startRejected', 'need_two_players')
            if (roster.some(player => !player.isReady)) return send(socket.id, 'startRejected', 'players_not_ready')
            const serverRoster = roster.map(({ name, socketID }) => ({ name, socketID }))
            const game = startGame(serverRoster, leaderSocketID)
            if (!game || typeof game.start !== 'function') return send(socket.id, 'startRejected', 'game_start_failed')
            started = true
            gameSocket.emit('startGame')
            setTimeout(() => game.start(), 50)
        })

        socket.on('disconnect', () => {
            if (started) return
            const wasLeader = socket.id === leaderSocketID
            const index = seats.findIndex(candidate => candidate.socketID === socket.id)
            if (index >= 0) seats.splice(index, 1)
            if (wasLeader) {
                gameSocket.emit('leaderDisconnect', 'leader_disconnected')
                cleanup()
                return
            }
            emitPartyUpdate()
        })
    })

    const emptyRoomCheck = setInterval(() => {
        if (!Object.keys(gameSocket.sockets || {}).length) {
            clearInterval(emptyRoomCheck)
            cleanup()
        }
    }, 10000)
    if (typeof emptyRoomCheck.unref === 'function') emptyRoomCheck.unref()

    return { seats, get leaderSocketID() { return leaderSocketID }, get started() { return started } }
}

module.exports = { openLobby }
