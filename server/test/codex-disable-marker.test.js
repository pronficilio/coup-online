'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createDisableMarker } = require('../ai/codex-disable-marker')

test('shared Codex disable marker is atomic, private, and fail-closed', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'coup-codex-marker-'))
    const filePath = path.join(directory, 'codex-disabled')
    const marker = createDisableMarker(filePath)
    try {
        await marker.verifyWritable()
        assert.equal(await marker.isDisabled(), false)
        assert.equal(await marker.disable(), true)
        assert.equal(await marker.isDisabled(), true)
        assert.equal(await fs.readFile(filePath, 'utf8'), 'disabled\n')
        assert.equal((await fs.stat(filePath)).mode & 0o777, 0o660)

        await fs.rm(filePath)
        await fs.symlink('/dev/null', filePath)
        assert.equal(await marker.isDisabled(), true)
    } finally {
        await fs.rm(directory, { recursive: true, force: true })
    }
})
