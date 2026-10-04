const test = require('node:test')
const assert = require('node:assert/strict')
const { isAllowedOrigin } = require('../utilities/origin-policy')

const allowedOrigin = 'https://st-coup.ejele.net'

test('origin policy accepts the configured Origin or a same-origin Referer URL', () => {
    assert.equal(isAllowedOrigin(allowedOrigin, allowedOrigin), true)
    assert.equal(isAllowedOrigin('https://st-coup.ejele.net/create', allowedOrigin), true)
    assert.equal(isAllowedOrigin('https://st-coup.ejele.net/create?from=home', allowedOrigin), true)
    assert.equal(isAllowedOrigin('https://attacker.invalid', allowedOrigin), false)
    assert.equal(isAllowedOrigin('https://st-coup.ejele.net.attacker.invalid/create', allowedOrigin), false)
    assert.equal(isAllowedOrigin('https://attacker.invalid/?origin=https://st-coup.ejele.net', allowedOrigin), false)
    assert.equal(isAllowedOrigin('https://st-coup.ejele.net.attacker.invalid', allowedOrigin), false)
    assert.equal(isAllowedOrigin(undefined, allowedOrigin), false)
    assert.equal(isAllowedOrigin(null, allowedOrigin), false)
})
