var Card = aReq('server/game/card');

var cards = Card.suits.reduce((cards, suit) => {
    Card.ranks.forEach(rank => cards.push(new Card(suit, rank)));
    return cards;
}, []);

module.exports = cards;
