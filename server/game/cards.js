var Card = require('./card.js');

var cards = Card.suits.reduce((cards, suit) =>
    Card.ranks.reduce((cards, rank) => {
        cards.push(new Card(suit, rank));
        return cards;
    }, cards)
, []);

module.exports = cards;
