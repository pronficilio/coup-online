'use strict'

const crypto = require('node:crypto')
const net = require('node:net')

const socketPath = process.env.CODEX_RUNNER_SOCKET || '/run/coup-codex/runner.sock'
const socket = net.createConnection({ path: socketPath })
let buffer = ''
let finished = false

const finish = success => {
    if (finished) return
    finished = true
    clearTimeout(timeout)
    socket.destroy()
    if (!success) process.exitCode = 1
}

const timeout = setTimeout(() => finish(false), 1500)
if (typeof timeout.unref === 'function') timeout.unref()

socket.once('connect', () => socket.write(`${JSON.stringify({
    operation: 'status',
    requestId: crypto.randomUUID()
})}\n`))
socket.on('data', chunk => {
    buffer += chunk.toString('utf8')
    if (Buffer.byteLength(buffer, 'utf8') > 2048) return finish(false)
    const newline = buffer.indexOf('\n')
    if (newline < 0) return
    if (buffer.slice(newline + 1).trim()) return finish(false)
    let response
    try { response = JSON.parse(buffer.slice(0, newline)) } catch (_) { return finish(false) }
    finish(Boolean(response && response.operation === 'status' && response.ok === true
        && typeof response.requestId === 'string' && typeof response.enabled === 'boolean'))
})
socket.once('error', () => finish(false))
