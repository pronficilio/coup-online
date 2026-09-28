import React from 'react'
import courtDeckImage from '../../assets/deck.webp'
import dukeImage from '../../assets/characters/duque.webp'
import captainImage from '../../assets/characters/capitan.webp'
import assassinImage from '../../assets/characters/asesino.webp'
import contessaImage from '../../assets/characters/condesa.webp'
import ambassadorImage from '../../assets/characters/embajador.webp'
import cardBackImage from '../../assets/characters/reverso.webp'
import playerIconImage from '../../assets/player.webp'
import coinImage from '../../assets/coin.webp'
import { getPlayerBoardSeats } from './playerBoardLayout'
import { t } from '../../i18n'
import './PlayerBoardStyles.css'

const INFLUENCE_SLOTS = [0, 1]
const INFLUENCE_IMAGES = {
    duke: dukeImage,
    captain: captainImage,
    assassin: assassinImage,
    contessa: contessaImage,
    ambassador: ambassadorImage
}

const ROLE_KEYS = {
    duke: 'game.roles.duke',
    captain: 'game.roles.captain',
    assassin: 'game.roles.assassin',
    contessa: 'game.roles.contessa',
    ambassador: 'game.roles.ambassador'
}

const REACTION_GLYPHS = {
    like: '👍',
    bravo: '👏',
    laugh: '😂',
    skeptical: '🤨',
    surprise: '😮',
    thinking: '🤔',
    dislike: '👎',
    secret: '🤫'
}

function roleLabel(role) {
    const key = ROLE_KEYS[String(role).toLowerCase()]
    return key ? t(key) : t('game.roles.unknown')
}

function getInfluenceImage(influence) {
    return INFLUENCE_IMAGES[String(influence).toLowerCase()] || cardBackImage
}

function renderInfluenceSlot(player, isObserver, observerInfluences, slotIndex) {
    const revealed = Array.isArray(player.revealedInfluences) ? player.revealedInfluences : []
    const own = isObserver && Array.isArray(observerInfluences) ? observerInfluences : []
    const knownCards = isObserver ? revealed.concat(own) : revealed
    const isActive = slotIndex < (revealed.length + (isObserver ? own.length : (player.influenceCount || 0)))
    const isLost = slotIndex < revealed.length
    const isOwnActive = isObserver && slotIndex >= revealed.length && slotIndex < revealed.length + own.length

    if (!isActive) {
        return <div className="PlayerInfluenceEntry" key={slotIndex}>
            <span
                className="PlayerInfluenceSlot PlayerInfluenceSlot--inactive"
                aria-hidden="true"
            />
        </div>
    }

    if (knownCards[slotIndex]) {
        const influence = knownCards[slotIndex]
        return <div className="PlayerInfluenceEntry" key={slotIndex}>
            <span
                className={`PlayerInfluenceSlot PlayerInfluenceSlot--face${isLost ? ' PlayerInfluenceSlot--lost' : ''}`}
                role="img"
                aria-label={isLost
                    ? t('game.playerBoard.influenceLost', { roleLabel: roleLabel(influence) })
                    : t('game.playerBoard.influenceVisible', { roleLabel: roleLabel(influence) })}
            >
                <img
                    className="PlayerInfluenceImage"
                    src={getInfluenceImage(influence)}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                />
                {isLost && <span className="PlayerInfluenceLostOverlay" aria-hidden="true">
                    <span className="PlayerInfluenceLostMarker">×</span>
                </span>}
            </span>
            {(isOwnActive || isLost) && <span className="PlayerInfluenceRoleLabel">{roleLabel(influence)}</span>}
        </div>
    }

    // Do not pass the rival's influence value to any DOM attribute or child.
    return <div className="PlayerInfluenceEntry" key={slotIndex}>
        <span
            className="PlayerInfluenceSlot PlayerInfluenceSlot--back"
            role="img"
            aria-label={t('game.playerBoard.influenceHidden')}
        >
            <img
                className="PlayerInfluenceImage"
                src={cardBackImage}
                alt=""
                aria-hidden="true"
                draggable="false"
            />
        </span>
    </div>
}

export default function PlayerBoard(props) {
    const players = Array.isArray(props.players) ? props.players : []
    const seats = getPlayerBoardSeats(players, props.observerName)

    return (
        <div className="PlayerBoardContainer" data-player-count={players.length} role="group" aria-label={t('game.playerBoard.label')}>
            <div className="PlayerBoardCenter" aria-hidden="true" />
            <div className="PlayerBoardCourt">
                {Number.isFinite(props.courtCount) && <span className="PlayerBoardCourtCount" role="status" aria-live="polite">
                    {t('game.playerBoard.courtCount', { count: props.courtCount })}
                </span>}
                <img
                    className="PlayerBoardDeck"
                    src={courtDeckImage}
                    alt={t('game.playerBoard.deckAlt')}
                    draggable="false"
                />
            </div>
            {seats.map(({ player, seatIndex, left, top, isObserver }) => {
                const isCurrentPlayer = player.name === props.currentPlayer
                const isRespondable = isObserver && props.responseAvailable
                const serverSeat = players.findIndex(candidate => candidate.name === player.name)
                const reactionPresence = serverSeat === -1 ? null : props.reactionPresence?.[serverSeat]
                const seatEdge = left <= 15
                    ? 'left-far'
                    : left < 17
                        ? 'left-near'
                        : left >= 85
                            ? 'right-far'
                            : left > 83
                                ? 'right-near'
                                : undefined
                const seatClassName = [
                    'PlayerBoardSeat',
                    isObserver ? 'PlayerBoardSeat--observer' : '',
                    isCurrentPlayer && !props.responseWindowOpen ? 'PlayerBoardSeat--current' : '',
                    isRespondable ? 'PlayerBoardSeat--respondable' : ''
                ].filter(Boolean).join(' ')

                return <section
                    className={seatClassName}
                    key={player.name}
                    data-seat-index={seatIndex}
                    data-seat-edge={seatEdge}
                    data-seat-header-edge={left <= 20 ? 'left' : left >= 80 ? 'right' : undefined}
                    data-player-count={seats.length}
                    data-seat-lower-side={
                        seats.length >= 5 && top >= 60 && Math.abs(left - 50) >= 5 ? 'true' : undefined
                    }
                    data-seat-upper-side={
                        seats.length === 6 && top <= 40 && Math.abs(left - 50) >= 5 ? 'true' : undefined
                    }
                    data-seat-upper-center={top <= 40 && Math.abs(left - 50) < 5 ? 'true' : undefined}
                    data-seat-upper-right={top <= 40 && left >= 60 ? 'true' : undefined}
                    data-current-player={isCurrentPlayer ? 'true' : 'false'}
                    data-respondable={isRespondable ? 'true' : 'false'}
                    aria-current={isCurrentPlayer ? 'true' : undefined}
                    style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        '--player-color': player.color
                    }}
                >
                    <div className="PlayerBoardSeatHeader">
                        <h2 className="PlayerBoardSeatName" title={player.name}>
                            {reactionPresence && REACTION_GLYPHS[reactionPresence.reaction] && <span
                                key={reactionPresence.token}
                                className={`PlayerBoardReactionBubble${reactionPresence.fading ? ' PlayerBoardReactionBubble--fading' : ''}`}
                                role="status"
                                aria-label={t('game.playerBoard.reactionPresence', {
                                    playerName: player.name,
                                    reaction: t(`game.eventLog.reaction.${reactionPresence.reaction}`)
                                })}
                            >
                                <span aria-hidden="true">{REACTION_GLYPHS[reactionPresence.reaction]}</span>
                            </span>}
                            <img
                                className="PlayerBoardPlayerIcon"
                                src={playerIconImage}
                                alt=""
                                aria-hidden="true"
                                draggable="false"
                            />
                            <span className="PlayerBoardSeatNameText">
                                {player.name}{player.controller === 'codex' ? ` · ${t('lobby.ai.label')} (${t(`lobby.ai.effort.${player.effort}`)})` : ''}
                            </span>
                        </h2>
                        <p
                            className="PlayerBoardSeatCoins"
                            role="img"
                            aria-label={t('game.player.coinsAccessible', { coins: player.money })}
                        >
                            <img
                                className="PlayerBoardCoinIcon"
                                src={coinImage}
                                alt=""
                                aria-hidden="true"
                                draggable="false"
                            />
                            <span>{player.money}</span>
                        </p>
                    </div>
                    <div className="PlayerBoardSeatInfluences">
                        {INFLUENCE_SLOTS.map(slotIndex =>
                            renderInfluenceSlot(player, isObserver, props.observerInfluences, slotIndex)
                        )}
                    </div>
                </section>
            })}
        </div>
    )
}
