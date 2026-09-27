const dictionary = require('../coup-client/src/i18n/translations.json').es

const ROLE_KEYS = {
    duke: 'game.roles.duke',
    captain: 'game.roles.captain',
    assassin: 'game.roles.assassin',
    contessa: 'game.roles.contessa',
    ambassador: 'game.roles.ambassador'
}

const ACTION_KEYS = {
    income: 'income',
    foreign_aid: 'foreignAid',
    coup: 'coup',
    tax: 'tax',
    steal: 'steal',
    exchange: 'exchange',
    assassinate: 'assassinate'
}

function translate(key, params = {}) {
    const template = dictionary[key] || key
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, name) => (
        Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : placeholder
    ))
}

function roleLabel(role) {
    const key = ROLE_KEYS[String(role || '').toLowerCase()]
    return key ? translate(key) : translate('game.roles.unknown')
}

function actionLabel(action) {
    const key = ACTION_KEYS[String(action || '').toLowerCase()]
    return key ? translate(`game.actions.${key}.label`) : translate('game.actions.unknown')
}

module.exports = { translate, roleLabel, actionLabel }
