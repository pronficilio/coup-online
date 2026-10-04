const express = require('express')
const cors = require('cors')
const http = require('http')
const CoupGame = require('./game/coup')
const { openLobby } = require('./game/lobby')
const { CodexRunnerClient } = require('./ai/codex-client')
const { createDisableMarker } = require('./ai/codex-disable-marker')
const utilities = require('./utilities/utilities')
const { isAllowedOrigin } = require('./utilities/origin-policy')

const app = express()
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
app.use((req, res, next) => {
    const origin = req.get('Origin')
    if (origin && !isAllowedOrigin(origin, allowedOrigin)) {
        return res.status(403).json({ error: 'origin_not_allowed' })
    }
    next()
})
app.use(cors({ origin: allowedOrigin }))
const server = http.createServer(app)
const io = require('socket.io')(server)
io.origins((origin, callback) => {
    if (!isAllowedOrigin(origin, allowedOrigin)) {
        return callback('Origin not allowed', false)
    }
    callback(null, true)
})
const port = 8000
const namespaces = {}
const codexClient = new CodexRunnerClient()
const codexDisableMarker = createDisableMarker(process.env.CODEX_DISABLED_FILE)
let codexEmergencyDisabled = true
let codexEmergencyRequested = false

function emergencyDisableCodex() {
    codexEmergencyRequested = true
    codexEmergencyDisabled = true
    const persistedDisable = Promise.all([
        codexDisableMarker.disable().catch(() => null),
        codexClient.disable().catch(() => null)
    ])
    Object.values(namespaces).forEach(game => {
        if (game && typeof game.disableCodex === 'function') game.disableCodex()
    })
    Object.keys(io.nsps || {}).forEach(name => {
        if (name !== '/') io.of(name).emit('codexDisabled', { disabled: true })
    })
    return persistedDisable
}

app.get('/createNamespace', (req, res) => {
    let code = ''
    while (!code || Object.prototype.hasOwnProperty.call(namespaces, code)) {
        code = utilities.generateNamespace()
    }
    const namespace = `/${code}`
    const gameSocket = io.of(namespace)
    namespaces[code] = null
    openLobby(gameSocket, namespace, {
        aiAccessCode: process.env.COUP_AI_ACCESS_CODE,
        isCodexDisabled: () => codexEmergencyDisabled,
        onEmergencyStop() {
            emergencyDisableCodex()
        },
        startGame(roster, leaderSocketID, spectatorSocketIDs) {
            const game = new CoupGame(roster, gameSocket, {
                leaderSocketID,
                codexClient,
                isCodexDisabled: () => codexEmergencyDisabled,
                spectatorSocketIDs
            })
            namespaces[code] = game
            return game
        },
        cleanup() {
            delete io.nsps[namespace]
            delete namespaces[code]
        }
    })
    console.log(`${code} created`)
    res.json({ namespace: code })
})

app.get('/exists/:namespace', (req, res) => {
    res.json({ exists: Object.prototype.hasOwnProperty.call(namespaces, req.params.namespace) })
})

server.listen(process.env.PORT || port, async () => {
    try {
        await codexDisableMarker.verifyWritable()
        const markerDisabled = await codexDisableMarker.isDisabled()
        if (markerDisabled) {
            codexEmergencyDisabled = true
        } else {
            const status = await codexClient.status()
            codexEmergencyDisabled = codexEmergencyRequested || !status.enabled
        }
    } catch (_) {
        codexEmergencyDisabled = true
    }
    Object.keys(io.nsps || {}).forEach(name => {
        if (name !== '/') io.of(name).emit('codexDisabled', { disabled: codexEmergencyDisabled })
    })
    console.log(`listening on ${process.env.PORT || port}`)
})
