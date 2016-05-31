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
    beforeBangResponse: function(step, card, target, attack, onResolved, onSkip) {
        if (!target.equipped.find(c => c === this))
            return onResolved();
        Barile.prototype.tryAvoid.apply(this, arguments);
    },
    beforeGatlingResponse: function(step, card, target, attack, onResolved, onSkip) {
        if (!target.equipped.find(c => c === this))
            return onResolved();
        Barile.prototype.tryAvoid.apply(this, arguments);
    },
    tryAvoid: function(step, card, target, attack, onResolved, onSkip) {
        if (attack.avoid === attack.required) return onResolved();
        onResolved(events('cardDraw', target, step)(
            target, step.phase.cards,
            // onDraw; try to avoid
            card => {
                step.phase.cards.discarded.push(card);

                if (card.suit === this.avoidSuit) this.handleAvoided(
                    step, card, target, attack, onResolved, onSkip
                );
                else this.handleShot(
                    step, card, target, attack, onResolved, onSkip
                );
            },
            // onCance; don't use barrel
            misc.merge(() => onResolved(), { arg: 'don\'t use barile' }),
            () => ({
                for: 'barile',
                source: step.player.name,
                target: target.name,
                barile: this.format()
            })
        ));
    },
    handleAvoided: function(step, card, target, attack, onResolved, onSkip) {
        attack.avoid++;
        step.game.onGameEvent({
            name: 'barile',
            what: 'avoid',
            source: step.player.name,
            target: target.name,
            barile: this.format(),
            card: card.format()
        });
        onResolved();
    },
    handleShot: function(step, card, target, attack, onResolved, onSkip) {
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