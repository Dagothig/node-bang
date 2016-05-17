var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    Equipment = aReq('server/game/cards/equipment');

function Barile(suit, rank) {
    Equipment.call(this, 'barile', suit, rank, 'barile');
    this.avoidSuit = Card.suits.hearts;
}
misc.extend(Equipment, Barile, {
    format: function() {
        return misc.merge(Equipment.prototype.format.apply(this, arguments), {
            avoidSuit: this.avoidSuit
        });
    },
    getTarget: events('targetSelf'),
    beforeBangResponse: function(step, card, target, onResolved, onSkip, skipCheck) {
        if (!skipCheck && !target.equipped.find(c => c === this))
            return onResolved();

        onResolved(events('cardDraw', target)(
            target, step.phase.cards,
            card => {
                // TODO; tell what card was flipped
                step.phase.cards.discarded.push(card);
                if (card.suit === this.avoidSuit) onSkip();
                else onResolved();
            },
            () => onResolved(),
            () => ({
                name: 'barile',
                source: step.player.name,
                target: target.name,
                barile: this.format()
            })
        ));
    }
});

module.exports = Barile;