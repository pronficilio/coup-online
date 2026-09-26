'use strict'

const fs = require('node:fs/promises')
const net = require('node:net')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')
const protocol = require('./codex-protocol')

const MAX_LINE_BYTES = protocol.MAX_REQUEST_BYTES + 1
const DEFAULT_TIMEOUT_MS = 45000
const DEFAULT_MAX_CONCURRENCY = 2

function pathIsInside(parent, candidate) {
    const relative = path.relative(path.resolve(parent), path.resolve(candidate))
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

function configuredPaths(env = process.env, tempRoot = os.tmpdir()) {
    const codeHome = env.CODEX_HOME
    const workDir = env.CODEX_WORKDIR
    const appRoot = env.CODEX_APP_ROOT
    if (!codeHome || !path.isAbsolute(codeHome) || !workDir || !path.isAbsolute(workDir)
        || !appRoot || !path.isAbsolute(appRoot) || !path.isAbsolute(tempRoot)) {
        throw Object.assign(new Error('Codex runner paths are not configured.'), { code: 'runner_not_configured' })
    }
    const roots = [codeHome, workDir, appRoot, tempRoot].map(value => path.resolve(value))
    const overlap = (left, right) => pathIsInside(left, right) || pathIsInside(right, left)
    if (roots.some((root, index) => roots.slice(index + 1).some(other => overlap(root, other)))) {
        throw Object.assign(new Error('Codex credentials and workspace must be isolated.'), { code: 'runner_not_configured' })
    }
    return {
        appRoot: path.resolve(appRoot),
        codeHome: path.resolve(codeHome),
        workDir: path.resolve(workDir),
        tempRoot: path.resolve(tempRoot)
    }
}

async function verifyConfiguredPaths(env, tempRoot) {
    const paths = configuredPaths(env, tempRoot)
    let canonical
    try {
        canonical = Object.fromEntries(await Promise.all(
            Object.entries(paths).map(async ([name, value]) => [name, await fs.realpath(value)])
        ))
    } catch (_) {
        throw Object.assign(new Error('Codex runner paths must already exist.'), { code: 'runner_not_configured' })
    }
    const roots = Object.values(canonical)
    const overlap = (left, right) => pathIsInside(left, right) || pathIsInside(right, left)
    if (roots.some((root, index) => roots.slice(index + 1).some(other => overlap(root, other)))) {
        throw Object.assign(new Error('Codex runner paths resolve to overlapping directories.'), { code: 'runner_not_configured' })
    }
    const authDir = await fs.stat(canonical.codeHome)
    if (!authDir.isDirectory() || (authDir.mode & 0o077) !== 0) {
        throw Object.assign(new Error('Codex authentication directory must be private to the runner user.'), { code: 'runner_not_configured' })
    }
    try {
        const authFile = await fs.lstat(path.join(canonical.codeHome, 'auth.json'))
        if (!authFile.isFile() || authFile.isSymbolicLink() || (authFile.mode & 0o077) !== 0) {
            throw Object.assign(new Error('Codex authentication file must be private to the runner user.'), { code: 'runner_not_configured' })
        }
    } catch (error) {
        if (error.code !== 'ENOENT') throw error
    }
    const workContents = await fs.readdir(canonical.workDir)
    if (workContents.length > 0) {
        throw Object.assign(new Error('Codex model workspace must be empty.'), { code: 'runner_not_configured' })
    }
    return canonical
}

function runnerEnvironment(env = process.env, paths = configuredPaths(env)) {
    return {
        PATH: env.CODEX_PATH || '/usr/local/bin:/usr/bin:/bin',
        HOME: paths.workDir,
        CODEX_HOME: paths.codeHome,
        TMPDIR: paths.tempRoot,
        LANG: env.LANG || 'C.UTF-8',
        TERM: 'dumb'
    }
}

function codexTimeoutFromEnv(env = process.env) {
    const value = Number(env.CODEX_DECISION_TIMEOUT_MS)
    if (Number.isFinite(value) && value >= 1000 && value <= 120000) return value
    return DEFAULT_TIMEOUT_MS
}

function codexConcurrencyFromEnv(env = process.env) {
    const value = Number(env.CODEX_MAX_CONCURRENCY)
    if (Number.isInteger(value) && value >= 1 && value <= 4) return value
    return DEFAULT_MAX_CONCURRENCY
}

function abortError(code = 'cancelled') {
    return Object.assign(new Error(code), { code })
}

function signalChildTree(child, signal) {
    if (process.platform !== 'win32' && Number.isInteger(child.pid)) {
        try {
            process.kill(-child.pid, signal)
            return
        } catch (_) {}
    }
    try { child.kill(signal) } catch (_) {}
}

async function runCodexDecision(request, options = {}) {
    const normalized = protocol.normalizeRequest(request)
    const envSource = options.env || process.env
    const tempRoot = options.tempRoot || os.tmpdir()
    const paths = await verifyConfiguredPaths(envSource, tempRoot)
    const childEnv = runnerEnvironment(envSource, paths)
    const scratch = await fs.mkdtemp(path.join(paths.tempRoot, 'coup-codex-'))
    await fs.chmod(scratch, 0o700)
    const schemaPath = path.join(scratch, 'choice.schema.json')
    const outputPath = path.join(scratch, 'choice.json')
    await fs.writeFile(schemaPath, JSON.stringify(protocol.outputSchema(normalized)), { mode: 0o600, flag: 'wx' })

    const executable = options.executable || envSource.CODEX_BIN || 'codex'
    const args = protocol.execArgs(normalized, schemaPath, outputPath)
    const spawnImpl = options.spawn || spawn
    const timeoutMs = options.timeoutMs || codexTimeoutFromEnv(envSource)
    const signal = options.signal

    try {
        const choiceId = await new Promise((resolve, reject) => {
            if (signal && signal.aborted) return reject(abortError())
            let settled = false
            let child
            let childClosed = false
            let terminationCode = null
            let timeout
            let escalation
            let terminationDeadline
            const finish = (error, value) => {
                if (settled) return
                settled = true
                clearTimeout(timeout)
                clearTimeout(escalation)
                clearTimeout(terminationDeadline)
                if (signal) signal.removeEventListener('abort', onAbort)
                if (error) reject(error)
                else resolve(value)
            }
            const terminate = code => {
                if (!child || childClosed || terminationCode) return
                terminationCode = code
                signalChildTree(child, 'SIGTERM')
                if (childClosed) return
                escalation = setTimeout(() => {
                    if (!childClosed) signalChildTree(child, 'SIGKILL')
                }, 1000)
                terminationDeadline = setTimeout(() => {
                    if (!childClosed) finish(abortError('codex_termination_failed'))
                }, 5000)
                if (typeof escalation.unref === 'function') escalation.unref()
                if (typeof terminationDeadline.unref === 'function') terminationDeadline.unref()
            }
            const onAbort = () => {
                terminate('cancelled')
            }
            try {
                child = spawnImpl(executable, args, {
                    cwd: paths.workDir,
                    env: childEnv,
                    shell: false,
                    detached: process.platform !== 'win32',
                    windowsHide: true,
                    stdio: ['pipe', 'ignore', 'ignore']
                })
            } catch (_) {
                return finish(abortError('codex_unavailable'))
            }
            if (signal) signal.addEventListener('abort', onAbort, { once: true })
            timeout = setTimeout(() => {
                terminate('codex_timeout')
            }, timeoutMs)
            if (typeof timeout.unref === 'function') timeout.unref()
            child.once('error', () => finish(abortError('codex_unavailable')))
            child.once('close', async code => {
                childClosed = true
                if (terminationCode) return finish(abortError(terminationCode))
                if (code !== 0) return finish(abortError('codex_failed'))
                try {
                    const output = await fs.readFile(outputPath, 'utf8')
                    finish(null, protocol.parseChoice(output, normalized))
                } catch (error) {
                    finish(error.code === 'invalid_request' ? error : abortError('codex_invalid_output'))
                }
            })
            child.stdin.on('error', () => finish(abortError('codex_failed')))
            child.stdin.end(protocol.promptFor(normalized))
        })
        return {
            requestId: normalized.requestId,
            decisionId: normalized.decisionId,
            stateVersion: normalized.stateVersion,
            rulesVersion: protocol.RULESET_VERSION,
            choiceId
        }
    } finally {
        await fs.rm(scratch, { recursive: true, force: true })
    }
}

function responseLine(value) {
    return `${JSON.stringify(value)}\n`
}

function createRunnerServer(options = {}) {
    const socketPath = options.socketPath || process.env.CODEX_RUNNER_SOCKET || '/run/coup-codex/runner.sock'
    const runDecision = options.runDecision || runCodexDecision
    const maxConcurrency = options.maxConcurrency || codexConcurrencyFromEnv(options.env || process.env)
    let active = 0

    const server = net.createServer(socket => {
        socket.setNoDelay(true)
        let buffer = ''
        let handled = false
        let controller = null
        let responseSent = false

        socket.on('data', chunk => {
            if (handled) return
            buffer += chunk.toString('utf8')
            if (Buffer.byteLength(buffer, 'utf8') > MAX_LINE_BYTES) {
                handled = true
                socket.end(responseLine({ ok: false, error: 'request_too_large' }))
                return
            }
            const newline = buffer.indexOf('\n')
            if (newline === -1) return
            const line = buffer.slice(0, newline)
            if (buffer.slice(newline + 1).trim()) {
                handled = true
                socket.end(responseLine({ ok: false, error: 'invalid_request' }))
                return
            }
            handled = true
            let request
            try {
                request = protocol.normalizeRequest(JSON.parse(line))
            } catch (_) {
                socket.end(responseLine({ ok: false, error: 'invalid_request' }))
                return
            }
            if (active >= maxConcurrency) {
                socket.end(responseLine({
                    requestId: request.requestId,
                    decisionId: request.decisionId,
                    stateVersion: request.stateVersion,
                    ok: false,
                    error: 'busy'
                }))
                return
            }
            active += 1
            controller = new AbortController()
            const cancelIfDisconnected = () => {
                if (!responseSent) controller.abort()
            }
            socket.once('close', cancelIfDisconnected)
            Promise.resolve(runDecision(request, { signal: controller.signal }))
                .then(result => {
                    responseSent = true
                    if (!socket.destroyed) socket.end(responseLine({
                        requestId: request.requestId,
                        decisionId: request.decisionId,
                        stateVersion: request.stateVersion,
                        rulesVersion: protocol.RULESET_VERSION,
                        ok: true,
                        choiceId: result.choiceId
                    }))
                })
                .catch(error => {
                    responseSent = true
                    if (!socket.destroyed) socket.end(responseLine({
                        requestId: request.requestId,
                        decisionId: request.decisionId,
                        stateVersion: request.stateVersion,
                        ok: false,
                        error: ['codex_timeout', 'cancelled', 'busy'].includes(error.code) ? error.code : 'codex_failed'
                    }))
                })
                .finally(() => {
                    active -= 1
                    socket.removeListener('close', cancelIfDisconnected)
                })
        })
        socket.on('end', () => {
            if (!handled && !socket.destroyed) socket.end(responseLine({ ok: false, error: 'invalid_request' }))
        })
        socket.on('error', () => {
            if (controller) controller.abort()
        })
    })

    return {
        server,
        async listen() {
            await fs.mkdir(path.dirname(socketPath), { recursive: true, mode: 0o750 })
            await new Promise((resolve, reject) => {
                server.once('error', reject)
                server.listen(socketPath, resolve)
            })
            await fs.chmod(socketPath, 0o660)
            return socketPath
        },
        async close() {
            await new Promise(resolve => server.close(() => resolve()))
            await fs.rm(socketPath, { force: true })
        }
    }
}

if (require.main === module) {
    const runner = createRunnerServer()
    runner.listen().then(socketPath => {
        process.stdout.write(`Codex runner listening on ${socketPath}\n`)
    }).catch(() => {
        process.stderr.write('Codex runner failed to start.\n')
        process.exitCode = 1
    })
}

module.exports = { createRunnerServer, runCodexDecision, configuredPaths, runnerEnvironment }
