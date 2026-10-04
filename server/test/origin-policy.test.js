const test = require('node:test')
const assert = require('node:assert/strict')
const { isAllowedOrigin } = require('../utilities/origin-policy')

const allowedOrigin = 'https://st-coup.ejele.net'

test('origin policy allows same-origin requests without Origin and the configured exact origin', () => {
    assert.equal(isAllowedOrigin(allowedOrigin, allowedOrigin), true)
    assert.equal(isAllowedOrigin(undefined, allowedOrigin), true)
    assert.equal(isAllowedOrigin(null, allowedOrigin), true)
    assert.equal(isAllowedOrigin('https://attacker.invalid', allowedOrigin), false)
    assert.equal(isAllowedOrigin('https://st-coup.ejele.net.attacker.invalid', allowedOrigin), false)
})
