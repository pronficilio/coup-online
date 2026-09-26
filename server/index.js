const express = require('express')
const cors = require('cors')
const http = require('http')
const CoupGame = require('./game/coup')
const { openLobby } = require('./game/lobby')
const utilities = require('./utilities/utilities')

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = require('socket.io')(server)
const port = 8000
const namespaces = {}

app.get('/createNamespace', (req, res) => {
    let code = ''
    while (!code || Object.prototype.hasOwnProperty.call(namespaces, code)) {
        code = utilities.generateNamespace()
    }
    const namespace = `/${code}`
    const gameSocket = io.of(namespace)
    namespaces[code] = null
    openLobby(gameSocket, namespace, {
        startGame(roster, leaderSocketID) {
            const game = new CoupGame(roster, gameSocket, { leaderSocketID })
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

server.listen(process.env.PORT || port, () => {
    console.log(`listening on ${process.env.PORT || port}`)
})
