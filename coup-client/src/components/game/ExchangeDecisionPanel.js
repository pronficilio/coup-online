import React, { useState } from 'react'
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

function roleSignature(roles) {
    return JSON.stringify(roles.map(role => String(role).toLowerCase()).sort())
}

function initialSelection(poolSlots) {
    return poolSlots.reduce((selected, slot, index) => {
        if (slot.original) selected.push(index)
        return selected
    }, [])
}

export default function ExchangeDecisionPanel({ decision, keepCount, submitted, paused, error, onChoose, panelTitle }) {
    const poolSlots = Array.isArray(decision.poolSlots) ? decision.poolSlots : []
    const [selectionState, setSelectionState] = useState(null)
    const currentSelection = selectionState && selectionState.decisionId === decision.decisionId
        ? selectionState
        : {
            decisionId: decision.decisionId,
            selectedIndices: initialSelection(poolSlots),
            nextSlot: keepCount === 2 ? 1 : 0
        }
    const selectedIndices = currentSelection.selectedIndices
    const selectedRoles = selectedIndices.map(index => poolSlots[index] && poolSlots[index].role).filter(Boolean)
    const selectionSignature = roleSignature(selectedRoles)
    const selectedOption = (Array.isArray(decision.options) ? decision.options : []).find(option =>
        roleSignature(Array.isArray(option.roles) ? option.roles : []) === selectionSignature
    )
    const caption = t('game.decision.exchange.keepCaption', {
        roles: selectedRoles.map(roleName).join(` ${t('game.common.and')} `)
    })

    const selectSlot = index => {
        if (submitted || paused || selectedIndices.includes(index) || selectedIndices.length !== keepCount) return
        const replaceSlot = keepCount === 1 ? 0 : currentSelection.nextSlot
        const nextSelected = selectedIndices.slice()
        nextSelected[replaceSlot] = index
        setSelectionState({
            decisionId: decision.decisionId,
            selectedIndices: nextSelected,
            nextSlot: keepCount === 2 ? (replaceSlot === 1 ? 0 : 1) : 0
        })
    }

    return <section className="ActionDecision DecisionActionPanel ExchangeDecisionPanel" aria-labelledby="exchange-decision-title">
        <h2 id="exchange-decision-title" className="ActionDecisionTitle">{panelTitle}</h2>
        <p className="DecisionPanelSubtitle">
            {t('game.decision.title.exchange', {
                count: keepCount,
                influenceLabel: keepCount === 1 ? t('game.influence.singular') : t('game.influence.plural')
            })}
        </p>
        <p className="DecisionActionPrompt">
            {t('game.decision.description.exchange', { count: keepCount })}
        </p>
        <div className="ExchangePoolCards" role="group" aria-label={t('game.decision.exchange.poolLabel')}>
            {poolSlots.map((slot, index) => {
                const role = String(slot.role).toLowerCase()
                const label = roleName(role)
                const selected = selectedIndices.includes(index)
                const source = slot.original
                    ? t('game.decision.exchange.originalCard')
                    : t('game.decision.exchange.drawnCard')
                return <button
                    key={`${decision.decisionId}-slot-${index}`}
                    type="button"
                    className={`ExchangePoolCard${selected ? ' ExchangePoolCard--selected' : ''}`}
                    disabled={submitted || paused}
                    aria-pressed={selected}
                    aria-label={t('game.decision.exchange.cardLabel', {
                        source,
                        role: label,
                        position: t('game.decision.exchange.cardPosition', { position: index + 1, count: poolSlots.length }),
                        selected: selected ? t('game.decision.exchange.selected') : ''
                    })}
                    onClick={() => selectSlot(index)}
                >
                    <span className="ExchangePoolCardImage">
                        <img src={ROLE_IMAGES[role]} alt="" aria-hidden="true" draggable="false" />
                    </span>
                    <span className="ExchangePoolCardLabel">{label}</span>
                    <span className="ExchangePoolCardSource">{source}</span>
                </button>
            })}
        </div>
        <button
            type="button"
            className="ExchangeKeepSubmit"
            disabled={submitted || paused || !selectedOption}
            onClick={() => selectedOption && onChoose(selectedOption)}
        >{caption}</button>
        {submitted && <p className="ExchangeDecisionStatus" role="status">{t('game.decision.exchange.sent')}</p>}
        {error && <p className="ActionError" role="alert">{error}</p>}
    </section>
}
