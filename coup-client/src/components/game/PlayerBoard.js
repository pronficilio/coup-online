import React, { useEffect, useRef, useState } from 'react'
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
import OwnCardZoom from './OwnCardZoom'
import { t } from '../../i18n'
import './PlayerBoardStyles.css'

const INFLUENCE_SLOTS = [0, 1]
const EMPTY_PLAYERS = []
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

function renderInfluenceSlot(player, isObserver, observerInfluences, slotIndex, onOpenOwnInfluence, zoomedSlotIndex, zoomDisabled) {
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
        const isZoomable = isOwnActive && !isLost
        const roleLabelText = roleLabel(influence)
        const accessibleLabel = isZoomable
            ? t('game.playerBoard.zoom.open', { roleLabel: roleLabelText })
            : isLost
                ? t('game.playerBoard.influenceLost', { roleLabel: roleLabelText })
                : t('game.playerBoard.influenceVisible', { roleLabel: roleLabelText })
        const slotClassName = `PlayerInfluenceSlot PlayerInfluenceSlot--face${isLost ? ' PlayerInfluenceSlot--lost' : ''}${isZoomable ? ' PlayerInfluenceSlot--interactive' : ''}`
        const image = <img
            className="PlayerInfluenceImage"
            src={getInfluenceImage(influence)}
            alt=""
            aria-hidden="true"
            draggable="false"
        />
        const lostOverlay = isLost && <span className="PlayerInfluenceLostOverlay" aria-hidden="true">
            <span className="PlayerInfluenceLostMarker">×</span>
        </span>
        return <div className="PlayerInfluenceEntry" key={slotIndex}>
            {isZoomable
                ? <button
                    type="button"
                    className={slotClassName}
                    aria-label={accessibleLabel}
                    aria-haspopup="dialog"
                    aria-expanded={zoomedSlotIndex === slotIndex}
                    data-own-influence={String(influence).toLowerCase()}
                    disabled={zoomDisabled}
                    onClick={event => onOpenOwnInfluence(influence, slotIndex, event.currentTarget)}
                >
                    {image}
                </button>
                : <span
                    className={slotClassName}
                    role="img"
                    aria-label={accessibleLabel}
                >
                    {image}
                    {lostOverlay}
                </span>}
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
    const [zoomedCard, setZoomedCard] = useState(null)
    const [zoomOpen, setZoomOpen] = useState(false)
    const boardRef = useRef(null)
    const zoomedCardRef = useRef(null)
    const zoomSessionRef = useRef(0)
    zoomedCardRef.current = zoomedCard
    const players = Array.isArray(props.players) ? props.players : EMPTY_PLAYERS
    const seats = getPlayerBoardSeats(players, props.observerName)
    const observerInfluences = Array.isArray(props.observerInfluences) ? props.observerInfluences : []
    const zoomDisabled = Boolean(props.zoomDisabled)
    const pendingDecisionSeats = new Set(Array.isArray(props.pendingDecisionSeats)
        ? props.pendingDecisionSeats.filter(Number.isInteger)
        : [])

    const openOwnInfluence = (influence, slotIndex, originElement) => {
        const label = roleLabel(influence)
        setZoomedCard({
            sessionId: zoomSessionRef.current + 1,
            roleKey: String(influence).toLowerCase(),
            slotIndex,
            imageSrc: getInfluenceImage(influence),
            cardName: t('game.playerBoard.zoom.name', { roleLabel: label }),
            cardLabel: t('game.playerBoard.zoom.close', { roleLabel: label }),
            originElement
        })
        zoomSessionRef.current += 1
        setZoomOpen(true)
    }

    useEffect(() => {
        if (!zoomOpen || !zoomedCard) return

        const originIsActive = zoomedCard.originElement
            && zoomedCard.originElement.isConnected
            && zoomedCard.originElement.dataset.ownInfluence === zoomedCard.roleKey
        if (zoomDisabled || !originIsActive) setZoomOpen(false)
    }, [players, props.observerInfluences, zoomDisabled, zoomOpen, zoomedCard])

    const finishZoomClose = (closedOriginElement, closedSessionId) => {
        if (!zoomedCardRef.current
            || zoomedCardRef.current.originElement !== closedOriginElement
            || zoomedCardRef.current.sessionId !== closedSessionId) return
        setZoomOpen(false)
        setZoomedCard(null)
    }

    return (
        <div ref={boardRef} tabIndex="-1" className="PlayerBoardContainer" data-player-count={players.length} role="group" aria-label={t('game.playerBoard.label')}>
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
                const isPendingDecision = pendingDecisionSeats.has(serverSeat)
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
                    isCurrentPlayer ? 'PlayerBoardSeat--current' : '',
                    isPendingDecision ? 'PlayerBoardSeat--pending' : '',
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
                    data-pending-decision={isPendingDecision ? 'true' : 'false'}
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
                            renderInfluenceSlot(
                                player,
                                isObserver,
                                observerInfluences,
                                slotIndex,
                                openOwnInfluence,
                                zoomOpen && zoomedCard ? zoomedCard.slotIndex : null,
                                zoomDisabled
                            )
                        )}
                    </div>
                </section>
            })}
            <OwnCardZoom
                open={zoomOpen}
                sessionId={zoomedCard && zoomedCard.sessionId}
                imageSrc={zoomedCard && zoomedCard.imageSrc}
                cardName={zoomedCard && zoomedCard.cardName}
                cardLabel={zoomedCard && zoomedCard.cardLabel}
                originElement={zoomedCard && zoomedCard.originElement}
                fallbackFocusElement={boardRef.current}
                onRequestClose={() => setZoomOpen(false)}
                onCloseComplete={finishZoomClose}
            />
        </div>
    )
}
