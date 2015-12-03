var cardColors = {
    black: 'black',
    red: 'red'
}
var cardRanks = ['ace', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'jack', 'queen', 'king'];
var cardSuits = {
    spades: {
        color: cardColors.black
    },
    clovers: {
        color: cardColors.black
    },
    hearts: {
        color: cardColors.red
    },
    diamonds: {
        color: cardColors.red
    }
}

function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;
}

module.exports = Card;
