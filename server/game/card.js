var misc = aReq('server/misc');

var ranks = {
    ace: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    jack: 11,
    queen: 12,
    king: 13
};
var rankValues = {};
Object.keys(ranks).forEach(rank => {
    rankValues[rank] = ranks[rank];
    ranks[rank] = rank;
});
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

function Card(name, suit, rank, type, filter, onPlay) {
    this.id = name + ':' + suit + ':' + rank;
    this.name = name;
    this.suit = suit;
    this.rank = rank;
    this.type = type;
    this.filter = filter || () => false;
    this.onPlay = onPlay;
}
Object.assign(Card, {
    ranks: ranks,
    rankValues: rankValues,
    suits: suits,
    types: types,
    rankWithin: function(rank, min, max) {
        return misc.bounded(
            rankValues[rank],
            rankValues[min],
            rankValues[max]
        );
    }
});
module.exports = Card;