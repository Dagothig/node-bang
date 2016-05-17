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
                step.phase.cards.discarded.push(card);

                if (card.suit === this.avoidSuit) {
                    this.handleAvoided(step, card, target, onResolved, onSkip);
                } else {
                    this.handleShot(step, card, target, onResolved, onSkip);
                }
            },
            () => onResolved(),
            () => ({
                name: 'barile',
                source: step.player.name,
                target: target.name,
                barile: this.format()
            })
        ));
    },
    handleAvoided: function(step, card, target, onResolved, onSkip) {
        step.game.onGameEvent({
            name: 'barile',
            what: 'avoid',
            source: step.player.name,
            target: target.name,
            barile: this.format(),
            card: card.format()
        });
        onSkip();
    },
    handleShot: function(step, card, target, onResolved, onSkip) {
        step.game.onGameEvent({
            name: 'barile',
            what: 'fail',
            source: step.player.name,
            target: target.name,
            barile: this.format(),
            card: card.format()
        });
        onResolved();
    }
});

module.exports = Barile;