function Suit(name, color) {
    this.name = name;
    this.color = color;
}

var colors = {
    black: 'black',
    red: 'red'
}
var ranks = {
    ace: 'ace',
    two: 'two',
    three: 'three',
    four: 'four',
    five: 'five',
    six: 'six',
    seven: 'seven',
    eight: 'eight',
    nine: 'nine',
    ten: 'ten',
    jack: 'jack',
    queen: 'queen',
    king: 'king'
}
var suits = {
    spades: new Suit('spades', colors.black),
    clovers: new Suit('clovers', colors.black),
    hearts: new Suit('hearts', colors.red),
    diamonds: new Suit('diamonds', colors.red)
};
var types = {
    brown: 'brown',
    blue: 'blue'
};

function Card(id, suit, rank, type, onPlay) {
    this.id = id;
    this.suit = suit;
    this.rank = rank;
    this.type = type;
    this.onPlay = onPlay;
}
Object.assign(Card, {
    colors: colors,
    ranks: ranks,
    suits: suits,
    types: types
});

module.exports = Card;
