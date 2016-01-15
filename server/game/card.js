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
    spades: 'spades',
    clovers: 'clovers',
    hearts: 'hearts',
    diamonds: 'diamonds'
};
var types = {
    brown: 'brown',
    blue: 'blue'
};

function Card(id, suit, rank, type, filter, onPlay) {
    this.id = id;
    this.suit = suit;
    this.rank = rank;
    this.type = type;
    this.filter = filter || () => false;
    this.onPlay = onPlay;
}
Object.assign(Card, {
    ranks: ranks,
    suits: suits,
    types: types
});

module.exports = Card;