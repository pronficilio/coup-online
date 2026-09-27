const crypto = require('node:crypto')

const EFFORTS = new Set(['low', 'medium', 'high'])

function sameCode(provided, expected) {
    if (typeof provided !== 'string' || typeof expected !== 'string' || !provided || !expected) return false
    const providedHash = crypto.createHash('sha256').update(provided, 'utf8').digest()
    const expectedHash = crypto.createHash('sha256').update(expected, 'utf8').digest()
    return crypto.timingSafeEqual(providedHash, expectedHash)
}

function openLobby(gameSocket, namespace, { startGame, cleanup, aiAccessCode = process.env.COUP_AI_ACCESS_CODE, onEmergencyStop, isCodexDisabled = () => false }) {
    const sharedAIcode = typeof aiAccessCode === 'string' && aiAccessCode.length >= 24 ? aiAccessCode : null
    const seats = []
    const aiSeats = []
    const authorizedSockets = new Set()
    const authorizationAttempts = new Map()
    let leaderSocketID = null
    let started = false
    let aiSeatSerial = 0

    const namedSeats = () => seats.filter(seat => seat.name)
    const participantCount = () => namedSeats().filter(seat => seat.participating).length + aiSeats.length
    const emitPartyUpdate = () => {
        gameSocket.emit('partyUpdate', [
            ...namedSeats().map(({ name, isReady, participating }) => ({
                name, isReady, participating, kind: 'human'
            })),
            ...aiSeats.map(({ name, effort }) => ({
                name, isReady: true, participating: true, kind: 'codex', effort
            }))
        ])
    }
    const send = (socketID, event, payload) => gameSocket.to(socketID).emit(event, payload)
    const updateSeat = (socket, patch) => {
        const seat = seats.find(candidate => candidate.socketID === socket.id)
        if (seat) Object.assign(seat, patch)
        return seat
    }

    gameSocket.on('connection', socket => {
        if (started || seats.length + aiSeats.length >= 6) {
            socket.emit('joinFailed', started ? 'game_already_started' : 'party_full')
            socket.disconnect(true)
            return
        }
        const seat = { socketID: socket.id, name: '', isReady: false, participating: true }
        seats.push(seat)

        socket.emit('codexAvailable', { available: Boolean(sharedAIcode) })
        socket.emit('codexDisabled', { disabled: Boolean(isCodexDisabled()) })

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
            if (namedSeats().length + aiSeats.length >= 6) return send(socket.id, 'joinFailed', 'party_full')
            seat.name = name
            if (!leaderSocketID) {
                leaderSocketID = socket.id
                seat.isReady = true
                send(socket.id, 'leader', true)
            }
            emitPartyUpdate()
            send(socket.id, 'joinSuccess', true)
        })

        socket.on('authorizeCodexAI', payload => {
            if (started || socket.id !== leaderSocketID || !seat.name || !sharedAIcode) {
                return send(socket.id, 'codexAuthorizationResult', { authorized: false })
            }
            const now = Date.now()
            const attempts = authorizationAttempts.get(socket.id) || []
            const recentAttempts = attempts.filter(timestamp => now - timestamp < 60000)
            if (recentAttempts.length >= 5) {
                authorizationAttempts.set(socket.id, recentAttempts)
                return send(socket.id, 'codexAuthorizationResult', { authorized: false })
            }
            recentAttempts.push(now)
            authorizationAttempts.set(socket.id, recentAttempts)
            const validPayload = payload && typeof payload === 'object' && !Array.isArray(payload)
                && Object.keys(payload).length === 1 && Object.prototype.hasOwnProperty.call(payload, 'code')
                && typeof payload.code === 'string' && payload.code.length <= 512
            const authorized = Boolean(validPayload && sameCode(payload.code, sharedAIcode))
            if (authorized) authorizedSockets.add(socket.id)
            send(socket.id, 'codexAuthorizationResult', { authorized })
        })

        socket.on('addCodexSeat', payload => {
            if (started || socket.id !== leaderSocketID || !authorizedSockets.has(socket.id)) return
            if (isCodexDisabled()) return send(socket.id, 'startRejected', 'codex_disabled')
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)
                || Object.keys(payload).length !== 1 || !EFFORTS.has(payload.effort)) {
                return send(socket.id, 'startRejected', 'invalid_ai_settings')
            }
            if (participantCount() >= 6) return send(socket.id, 'startRejected', 'party_full')
            let name
            do { name = `Codex ${++aiSeatSerial}` }
            while (namedSeats().some(other => other.name.toLocaleLowerCase() === name.toLocaleLowerCase())
                || aiSeats.some(other => other.name.toLocaleLowerCase() === name.toLocaleLowerCase()))
            aiSeats.push({ name, controller: 'codex', effort: payload.effort })
            emitPartyUpdate()
        })

        socket.on('removeCodexSeat', payload => {
            if (started || socket.id !== leaderSocketID || !authorizedSockets.has(socket.id)
                || payload !== undefined || aiSeats.length === 0) return
            aiSeats.pop()
            emitPartyUpdate()
        })

        socket.on('setParticipating', participating => {
            if (started || socket.id !== leaderSocketID || typeof participating !== 'boolean' || !seat.name) return
            updateSeat(socket, { participating })
            emitPartyUpdate()
        })

        socket.on('emergencyStopCodex', () => {
            if (socket.id !== leaderSocketID || !authorizedSockets.has(socket.id)) return
            if (typeof onEmergencyStop === 'function') onEmergencyStop(socket.id)
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
            const roster = namedSeats().filter(player => player.participating)
            if (aiSeats.length && !authorizedSockets.has(socket.id)) return send(socket.id, 'startRejected', 'codex_access_required')
            if (aiSeats.length && isCodexDisabled()) return send(socket.id, 'startRejected', 'codex_disabled')
            if (roster.some(player => !player.isReady)) return send(socket.id, 'startRejected', 'players_not_ready')
            const serverRoster = [
                ...roster.map(({ name, socketID }) => ({ name, socketID, controller: 'human' })),
                ...aiSeats.map(({ name, controller, effort }) => ({ name, controller, effort }))
            ]
            if (serverRoster.length < 2) return send(socket.id, 'startRejected', 'need_two_players')
            const spectators = namedSeats().filter(player => !player.participating).map(player => player.socketID)
            const game = startGame(serverRoster, leaderSocketID, spectators)
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
            authorizedSockets.delete(socket.id)
            authorizationAttempts.delete(socket.id)
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
