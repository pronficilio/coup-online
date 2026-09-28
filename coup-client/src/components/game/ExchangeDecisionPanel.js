import React from 'react'
import { t } from '../../i18n'
import dukeImage from '../../assets/characters/duque.webp'
import captainImage from '../../assets/characters/capitan.webp'
import assassinImage from '../../assets/characters/asesino.webp'
import contessaImage from '../../assets/characters/condesa.webp'
import ambassadorImage from '../../assets/characters/embajador.webp'

const ROLE_KEYS = {
    duke: 'game.roles.duke',
    captain: 'game.roles.captain',
    assassin: 'game.roles.assassin',
    contessa: 'game.roles.contessa',
    ambassador: 'game.roles.ambassador'
}

const ROLE_IMAGES = {
    duke: dukeImage,
    captain: captainImage,
    assassin: assassinImage,
    contessa: contessaImage,
    ambassador: ambassadorImage
}

function roleName(role) {
    const key = ROLE_KEYS[String(role).toLowerCase()]
    return key ? t(key) : t('game.roles.unknown')
}

function optionLabel(option) {
    const roles = Array.isArray(option.roles) ? option.roles : []
    return t('game.decision.option.keep', { roles: roles.map(roleName).join(' y ') })
}

export default function ExchangeDecisionPanel({ decision, keepCount, submitted, paused, error, onChoose }) {
    const influenceLabel = keepCount === 1 ? t('game.influence.singular') : t('game.influence.plural')

    return <section className="ActionDecision DecisionActionPanel ExchangeDecisionPanel" aria-labelledby="exchange-decision-title">
        <h2 id="exchange-decision-title" className="ActionDecisionTitle">
            {t('game.decision.title.exchange', { count: keepCount, influenceLabel })}
        </h2>
        <p className="DecisionActionPrompt">
            {t('game.decision.description.exchange', { count: keepCount })}
        </p>
        <div className="ExchangeDecisionOptions" role="group" aria-label={t('game.decision.title.exchange', { count: keepCount, influenceLabel })}>
            {(Array.isArray(decision.options) ? decision.options : []).map(option => {
                const optionRoles = Array.isArray(option.roles) ? option.roles : []
                const label = optionLabel(option)
                return <button
                    key={option.choiceId}
                    className="ExchangeDecisionOption"
                    type="button"
                    disabled={submitted || paused}
                    aria-label={label}
                    onClick={() => onChoose(option)}
                >
                    <span className="ExchangeDecisionCards" aria-hidden="true">
                        {optionRoles.map((role, index) => <img
                            className="ExchangeDecisionCard"
                            key={`${option.choiceId}-${role}-${index}`}
                            src={ROLE_IMAGES[String(role).toLowerCase()]}
                            alt=""
                            draggable="false"
                        />)}
                    </span>
                    <span className="ExchangeDecisionOptionLabel">{label}</span>
                </button>
            })}
        </div>
        {submitted && <p className="ExchangeDecisionStatus" role="status">{t('game.decision.exchange.sent')}</p>}
        {error && <p className="ActionError" role="alert">{error}</p>}
    </section>
}
