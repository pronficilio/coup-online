'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')

function createDisableMarker(filePath) {
    const temporaryPath = suffix => `${filePath}.${process.pid}.${crypto.randomUUID()}.${suffix}`

    return {
        async isDisabled() {
            if (!filePath) return false
            try {
                const marker = await fs.lstat(filePath)
                if (!marker.isFile() || marker.isSymbolicLink()) return true
                await fs.readFile(filePath, 'utf8')
                return true
            } catch (error) {
                return error.code === 'ENOENT' ? false : true
            }
        },

        async verifyWritable() {
            if (!filePath) return
            const probe = temporaryPath('probe')
            await fs.writeFile(probe, 'probe\n', { mode: 0o660, flag: 'wx' })
            await fs.unlink(probe)
        },

        async disable() {
            if (!filePath) return false
            const temporary = temporaryPath('tmp')
            await fs.writeFile(temporary, 'disabled\n', { mode: 0o660, flag: 'wx' })
            await fs.chmod(temporary, 0o660)
            await fs.rename(temporary, filePath)
            return true
        }
    }
}

module.exports = { createDisableMarker }
