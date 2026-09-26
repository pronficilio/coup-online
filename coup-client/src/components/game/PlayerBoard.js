import React from 'react'
import courtDeckImage from '../../assets/deck.webp'
import dukeImage from '../../assets/characters/duke.webp'
import captainImage from '../../assets/characters/captain.webp'
import assassinImage from '../../assets/characters/assassin.webp'
import contessaImage from '../../assets/characters/contessa.webp'
import ambassadorImage from '../../assets/characters/ambassador.webp'
import cardBackImage from '../../assets/characters/reverso.webp'
import { getPlayerBoardSeats } from './playerBoardLayout'
import './PlayerBoardStyles.css'

const INFLUENCE_SLOTS = [0, 1]
const INFLUENCE_IMAGES = {
    duke: dukeImage,
    captain: captainImage,
    assassin: assassinImage,
    contessa: contessaImage,
    ambassador: ambassadorImage
}

function getInfluenceImage(influence) {
    return INFLUENCE_IMAGES[String(influence).toLowerCase()] || cardBackImage
}

function renderInfluenceSlot(player, isObserver, slotIndex) {
    const influences = Array.isArray(player.influences) ? player.influences : []
    const isActive = !player.isDead && slotIndex < influences.length

    if (!isActive) {
        return <span
            className="PlayerInfluenceSlot PlayerInfluenceSlot--inactive"
            aria-hidden="true"
            key={slotIndex}
        />
    }

    if (isObserver) {
        const influence = influences[slotIndex]
        return <span
            className="PlayerInfluenceSlot PlayerInfluenceSlot--face"
            role="img"
            aria-label={`Influencia: ${influence}`}
            key={slotIndex}
        >
            <img
                className="PlayerInfluenceImage"
                src={getInfluenceImage(influence)}
                alt=""
                aria-hidden="true"
                draggable="false"
            />
        </span>
    }

    // Do not pass the rival's influence value to any DOM attribute or child.
    return <span
        className="PlayerInfluenceSlot PlayerInfluenceSlot--back"
        role="img"
        aria-label="Influencia oculta"
        key={slotIndex}
    >
        <img
            className="PlayerInfluenceImage"
            src={cardBackImage}
            alt=""
            aria-hidden="true"
            draggable="false"
        />
    </span>
}

export default function PlayerBoard(props) {
    const players = Array.isArray(props.players) ? props.players : []
    const seats = getPlayerBoardSeats(players, props.observerName)

    return (
        <div className="PlayerBoardContainer" role="group" aria-label="Tablero de jugadores">
            <div className="PlayerBoardCenter" aria-hidden="true" />
            <img
                className="PlayerBoardDeck"
                src={courtDeckImage}
                alt="Mazo central de la Corte"
                draggable="false"
            />
            {seats.map(({ player, seatIndex, left, top, isObserver }) => {
                const isCurrentPlayer = player.name === props.currentPlayer
                const seatClassName = [
                    'PlayerBoardSeat',
                    isCurrentPlayer ? 'PlayerBoardSeat--current' : ''
                ].filter(Boolean).join(' ')

                return <section
                    className={seatClassName}
                    key={player.name}
                    data-seat-index={seatIndex}
                    data-current-player={isCurrentPlayer ? 'true' : 'false'}
                    aria-current={isCurrentPlayer ? 'true' : undefined}
                    style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        '--player-color': player.color
                    }}
                >
                    <h2 className="PlayerBoardSeatName">{player.name}</h2>
                    <p className="PlayerBoardSeatCoins">Monedas: {player.money}</p>
                    <div className="PlayerBoardSeatInfluences">
                        {INFLUENCE_SLOTS.map(slotIndex =>
                            renderInfluenceSlot(player, isObserver, slotIndex)
                        )}
                    </div>
                </section>
            })}
        </div>
    )
}



