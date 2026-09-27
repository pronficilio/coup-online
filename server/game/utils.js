const constants = require('../utilities/constants')

function buildDeck(rng = Math.random) {
    const deck = []
    for (const card of constants.CardNames.values()) {
        for (let copy = 0; copy < 3; copy += 1) deck.push(card)
    }
    return shuffleArray(deck, rng)
}

function shuffleArray(array, rng = Math.random) {
    if (!Array.isArray(array)) throw new TypeError('Expected an array to shuffle.')
    for (let index = array.length - 1; index > 0; index -= 1) {
        const other = Math.floor(rng() * (index + 1))
        ;[array[index], array[other]] = [array[other], array[index]]
    }
    return array
}

module.exports = { buildDeck, shuffleArray }
