var log = aReq('server/log'),
    Card = aReq('server/game/card'),
    events = aReq('server/game/events');

function Bang(suit, rank) {
    var id = 'bang:' + suit.name + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown, step => {
        step.event = new events.TargetEvent(
            step.game, step.player, false, step.player.stat('bangRange'),
            target => {
                step.player.hand.discard(id);
                step.event = new events.CardChoiceEvent(
                    step.game, target,
                    card => card instanceof Mancato,
                    card => {
                        target.hand.discard(card.id);
                        delete step.event;
                    },
                    () => {
                        throw 'Handle bang succesful!';
                        delete step.event;
                    }
                );
            },
            () => delete step.event
        );
    });
}

function Mancato(suit, rank) {
    var id = 'mancato:' + suit.name + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown);
}

var cards = [
    new Bang(Card.suits.diamonds, Card.ranks.ace),
    new Bang(Card.suits.diamonds, Card.ranks.two),
    new Bang(Card.suits.diamonds, Card.ranks.three),
    new Bang(Card.suits.diamonds, Card.ranks.four),
    new Bang(Card.suits.diamonds, Card.ranks.five),
    new Bang(Card.suits.diamonds, Card.ranks.six),
    new Bang(Card.suits.diamonds, Card.ranks.seven),
    new Bang(Card.suits.diamonds, Card.ranks.eight),
    new Bang(Card.suits.diamonds, Card.ranks.nine),
    new Bang(Card.suits.diamonds, Card.ranks.ten),
    new Bang(Card.suits.diamonds, Card.ranks.jack),
    new Bang(Card.suits.diamonds, Card.ranks.queen),
    new Bang(Card.suits.diamonds, Card.ranks.king),

    new Bang(Card.suits.clovers, Card.ranks.two),
    new Bang(Card.suits.clovers, Card.ranks.three),
    new Bang(Card.suits.clovers, Card.ranks.five),
    new Bang(Card.suits.clovers, Card.ranks.four),
    new Bang(Card.suits.clovers, Card.ranks.six),
    new Bang(Card.suits.clovers, Card.ranks.seven),
    new Bang(Card.suits.clovers, Card.ranks.eight),
    new Bang(Card.suits.clovers, Card.ranks.nine),

    new Bang(Card.suits.hearts, Card.ranks.ace),
    new Bang(Card.suits.hearts, Card.ranks.queen),
    new Bang(Card.suits.hearts, Card.ranks.king),

    new Bang(Card.suits.spades, Card.ranks.ace),

    new Mancato(Card.suits.spades, Card.ranks.ace),
    new Mancato(Card.suits.spades, Card.ranks.two),
    new Mancato(Card.suits.spades, Card.ranks.three),
    new Mancato(Card.suits.spades, Card.ranks.four),
    new Mancato(Card.suits.spades, Card.ranks.five),
    new Mancato(Card.suits.spades, Card.ranks.six),

    new Mancato(Card.suits.spades, Card.ranks.seven),
    new Mancato(Card.suits.spades, Card.ranks.eight),
    new Mancato(Card.suits.spades, Card.ranks.nine),
    new Mancato(Card.suits.spades, Card.ranks.ten),
    new Mancato(Card.suits.spades, Card.ranks.jack),
    new Mancato(Card.suits.spades, Card.ranks.queen),
];

module.exports = cards;
