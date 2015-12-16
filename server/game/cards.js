var Card = aReq('server/game/card');

var cards = Card.suits.reduce((cards, suit) => {
    return Card.ranks.reduce((cards, rank) => {
        cards.push(new Card(suit, rank));
        return cards;
    }, cards)
}, []);

module.exports = cards;
