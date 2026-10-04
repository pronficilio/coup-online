function isAllowedOrigin(origin, allowedOrigin) {
    if (origin === undefined || origin === null) return true
    return origin === allowedOrigin
}

module.exports = { isAllowedOrigin }
