import React from 'react'
import { getPlayerBoardSeats } from './playerBoardLayout'
import './PlayerBoardStyles.css'

const INFLUENCE_SLOTS = [0, 1]

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
            {influence}
        </span>
    }

    // Do not pass the rival's influence value to any DOM attribute or child.
    return <span
        className="PlayerInfluenceSlot PlayerInfluenceSlot--back"
        role="img"
        aria-label="Influencia oculta"
        key={slotIndex}
    />
}

export default function PlayerBoard(props) {
    const players = Array.isArray(props.players) ? props.players : []
    const seats = getPlayerBoardSeats(players, props.observerName)

    return (
        <div className="PlayerBoardContainer" role="group" aria-label="Tablero de jugadores">
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



