const STANDARD_SEATS = {
  1: [{ left: 50, top: 86 }],
  2: [
    { left: 50, top: 86 },
    { left: 50, top: 14 },
  ],
  3: [
    { left: 50, top: 86 },
    { left: 50, top: 14 },
    { left: 86, top: 50 },
  ],
  4: [
    { left: 50, top: 86 },
    { left: 86, top: 50 },
    { left: 50, top: 14 },
    { left: 14, top: 50 },
  ],
};

const CENTER = 50;
const CIRCLE_RADIUS = 36;

function getSeatPosition(seatIndex, playerCount) {
  const standardLayout = STANDARD_SEATS[playerCount];

  if (standardLayout) {
    return standardLayout[seatIndex];
  }

  const angle = (seatIndex * 2 * Math.PI) / playerCount;

  return {
    left: Math.round((CENTER + CIRCLE_RADIUS * Math.sin(angle)) * 100) / 100,
    top: Math.round((CENTER + CIRCLE_RADIUS * Math.cos(angle)) * 100) / 100,
  };
}

/**
 * Arrange the server-ordered players around the board with the observer first.
 * Coordinates mark each seat's center as percentages of the board dimensions.
 */
export function getPlayerBoardSeats(players, observerName) {
  if (players.length === 0) {
    return [];
  }

  const observerIndex = players.findIndex((player) => player.name === observerName);
  const orderedPlayers = observerIndex === -1
    ? players.slice()
    : players.slice(observerIndex).concat(players.slice(0, observerIndex));

  return orderedPlayers.map((player, seatIndex) => ({
    player,
    seatIndex,
    ...getSeatPosition(seatIndex, orderedPlayers.length),
    isObserver: observerIndex !== -1 && seatIndex === 0,
  }));
}
