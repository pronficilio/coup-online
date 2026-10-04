function isAllowedOrigin(origin, allowedOrigin) {
    if (typeof origin !== 'string') return false
    if (origin === allowedOrigin) return true

    try {
        const candidate = new URL(origin)
        return candidate.origin === allowedOrigin && !candidate.username && !candidate.password
    } catch (_) {
        return false
    }
}

module.exports = { isAllowedOrigin }
