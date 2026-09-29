import brokenCrown from '../../assets/eventLogIcons/coronaRota.png'
import block from '../../assets/eventLogIcons/bloqueo.png'
import threeCoins from '../../assets/eventLogIcons/3coins.png'
import twoCoins from '../../assets/eventLogIcons/2coins.png'
import income from '../../assets/eventLogIcons/ingreso.png'
import death from '../../assets/eventLogIcons/muerte.png'
import loss from '../../assets/eventLogIcons/perdida.png'

const ACTION_ICONS = Object.freeze({
    income,
    foreign_aid: twoCoins,
    coup: brokenCrown,
    tax: threeCoins,
    assassinate: death,
    exchange: twoCoins,
    steal: twoCoins
})

const EVENT_ICONS = Object.freeze({
    challenge_started: brokenCrown,
    block_declared: block,
    block_challenge_started: brokenCrown,
    claim_proved: block,
    claim_not_proved: loss,
    influence_lost: loss,
    player_eliminated: death
})

export function getEventIcon(event) {
    const data = event && event.data ? event.data : {}
    if (event && (event.type === 'action_declared' || event.type === 'action_result')) {
        if (data.result === 'blocked') return block
        return ACTION_ICONS[data.action] || income
    }
    return event ? EVENT_ICONS[event.type] || income : income
}
