'use strict'

const crypto = require('node:crypto')
const net = require('node:net')
const protocol = require('./codex-protocol')

const MAX_RESPONSE_BYTES = 2048
const DEFAULT_CLIENT_TIMEOUT_MS = 50000

function runnerError(code) {
    return Object.assign(new Error(code), { code })
}

class CodexRunnerClient {
    constructor(options = {}) {
        this.socketPath = options.socketPath || process.env.CODEX_RUNNER_SOCKET || '/run/coup-codex/runner.sock'
        this.timeoutMs = options.timeoutMs || DEFAULT_CLIENT_TIMEOUT_MS
        this.connect = options.connect || net.createConnection
    }

    choose(input) {
        const request = protocol.normalizeRequest({
            requestId: input.requestId || crypto.randomUUID(),
            decisionId: input.decisionId,
            stateVersion: input.stateVersion,
            effort: input.effort || 'medium',
            observation: input.observation
        })
        return new Promise((resolve, reject) => {
            const socket = this.connect({ path: this.socketPath })
            let buffer = ''
            let settled = false
            const timeout = setTimeout(() => finish(runnerError('runner_timeout')), this.timeoutMs)
            if (typeof timeout.unref === 'function') timeout.unref()
            const signal = input.signal
            const onAbort = () => {
                socket.destroy()
                finish(runnerError('cancelled'))
            }
            const finish = (error, value) => {
                if (settled) return
                settled = true
                clearTimeout(timeout)
                if (signal) signal.removeEventListener('abort', onAbort)
                socket.removeAllListeners()
                socket.destroy()
                if (error) reject(error)
                else resolve(value)
            }
            if (signal && signal.aborted) return onAbort()
            if (signal) signal.addEventListener('abort', onAbort, { once: true })
            socket.once('connect', () => socket.write(`${JSON.stringify(request)}\n`))
            socket.on('data', chunk => {
                buffer += chunk.toString('utf8')
                if (Buffer.byteLength(buffer, 'utf8') > MAX_RESPONSE_BYTES) return finish(runnerError('invalid_runner_response'))
                const newline = buffer.indexOf('\n')
                if (newline === -1) return
                const extra = buffer.slice(newline + 1)
                if (extra.trim()) return finish(runnerError('invalid_runner_response'))
                let response
                try {
                    response = JSON.parse(buffer.slice(0, newline))
                } catch (_) {
                    return finish(runnerError('invalid_runner_response'))
                }
                if (!response || typeof response !== 'object' || Array.isArray(response)
                    || response.requestId !== request.requestId
                    || response.decisionId !== request.decisionId
                    || response.stateVersion !== request.stateVersion
                    || typeof response.ok !== 'boolean') {
                    return finish(runnerError('invalid_runner_response'))
                }
                if (!response.ok) {
                    if (Object.keys(response).sort().join(',') !== 'decisionId,error,ok,requestId,stateVersion'
                        || typeof response.error !== 'string') return finish(runnerError('invalid_runner_response'))
                    return finish(runnerError(response.error))
                }
                if (Object.keys(response).sort().join(',') !== 'choiceId,decisionId,ok,requestId,rulesVersion,stateVersion'
                    || response.rulesVersion !== protocol.RULESET_VERSION
                    || typeof response.choiceId !== 'string') return finish(runnerError('invalid_runner_response'))
                if (!request.observation.options.some(option => option.choiceId === response.choiceId)) {
                    return finish(runnerError('invalid_runner_choice'))
                }
                finish(null, {
                    decisionId: response.decisionId,
                    stateVersion: response.stateVersion,
                    rulesVersion: response.rulesVersion,
                    choiceId: response.choiceId
                })
            })
            socket.once('error', () => finish(runnerError('runner_unavailable')))
            socket.once('end', () => {
                if (!settled) finish(runnerError('invalid_runner_response'))
            })
        })
    }

    disable() {
        const requestId = crypto.randomUUID()
        return new Promise((resolve, reject) => {
            const socket = this.connect({ path: this.socketPath })
            let buffer = ''
            let settled = false
            const timeout = setTimeout(() => finish(runnerError('runner_timeout')), this.timeoutMs)
            if (typeof timeout.unref === 'function') timeout.unref()
            const finish = (error, value) => {
                if (settled) return
                settled = true
                clearTimeout(timeout)
                socket.removeAllListeners()
                socket.destroy()
                if (error) reject(error)
                else resolve(value)
            }
            socket.once('connect', () => socket.write(`${JSON.stringify({ operation: 'disable', requestId })}\n`))
            socket.on('data', chunk => {
                buffer += chunk.toString('utf8')
                if (Buffer.byteLength(buffer, 'utf8') > MAX_RESPONSE_BYTES) return finish(runnerError('invalid_runner_response'))
                const newline = buffer.indexOf('\n')
                if (newline === -1) return
                if (buffer.slice(newline + 1).trim()) return finish(runnerError('invalid_runner_response'))
                let response
                try { response = JSON.parse(buffer.slice(0, newline)) } catch (_) {
                    return finish(runnerError('invalid_runner_response'))
                }
                if (!response || typeof response !== 'object' || Array.isArray(response)
                    || Object.keys(response).sort().join(',') !== 'ok,operation,requestId'
                    || response.operation !== 'disable' || response.requestId !== requestId || response.ok !== true) {
                    return finish(runnerError('invalid_runner_response'))
                }
                finish(null, { disabled: true })
            })
            socket.once('error', () => finish(runnerError('runner_unavailable')))
            socket.once('end', () => {
                if (!settled) finish(runnerError('invalid_runner_response'))
            })
        })
    }

    status() {
        const requestId = crypto.randomUUID()
        return new Promise((resolve, reject) => {
            const socket = this.connect({ path: this.socketPath })
            let buffer = ''
            let settled = false
            const timeout = setTimeout(() => finish(runnerError('runner_timeout')), this.timeoutMs)
            if (typeof timeout.unref === 'function') timeout.unref()
            const finish = (error, value) => {
                if (settled) return
                settled = true
                clearTimeout(timeout)
                socket.removeAllListeners()
                socket.destroy()
                if (error) reject(error)
                else resolve(value)
            }
            socket.once('connect', () => socket.write(`${JSON.stringify({ operation: 'status', requestId })}\n`))
            socket.on('data', chunk => {
                buffer += chunk.toString('utf8')
                if (Buffer.byteLength(buffer, 'utf8') > MAX_RESPONSE_BYTES) return finish(runnerError('invalid_runner_response'))
                const newline = buffer.indexOf('\n')
                if (newline === -1) return
                if (buffer.slice(newline + 1).trim()) return finish(runnerError('invalid_runner_response'))
                let response
                try { response = JSON.parse(buffer.slice(0, newline)) } catch (_) {
                    return finish(runnerError('invalid_runner_response'))
                }
                if (!response || typeof response !== 'object' || Array.isArray(response)
                    || Object.keys(response).sort().join(',') !== 'enabled,ok,operation,requestId'
                    || response.operation !== 'status' || response.requestId !== requestId
                    || response.ok !== true || typeof response.enabled !== 'boolean') {
                    return finish(runnerError('invalid_runner_response'))
                }
                finish(null, { enabled: response.enabled })
            })
            socket.once('error', () => finish(runnerError('runner_unavailable')))
            socket.once('end', () => {
                if (!settled) finish(runnerError('invalid_runner_response'))
            })
        })
    }
}

module.exports = { CodexRunnerClient }
