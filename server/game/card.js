function Suit(name, color) {
    this.name = name;
    this.color = color;
}

var colors = {
    black: 'black',
    red: 'red'
}
var ranks = ['ace', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'jack', 'queen', 'king'];
var suits = [
    new Suit('spades', colors.black),
    new Suit('clovers', colors.black),
    new Suit('hearts', colors.red),
    new Suit('diamonds', colors.red)
];

function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;
}
Object.assign(Card, {
    colors: colors,
    ranks: ranks,
    suits: suits
});

module.exports = Card;
