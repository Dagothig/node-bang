var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    handles = aReq('server/game/handles'),
    Equipment = aReq('server/game/cards/equipment');

function Dynamite(suit, rank) {
    Equipment.call(this, 'dynamite', suit, rank, 'dynamite');
    this.boomSuit = Card.suits.spades;
    this.minRank = Card.ranks.two;
    this.maxRank = Card.ranks.nine;
}
misc.extend(Equipment, Dynamite, {
    format: function() {
        return misc.merge(Equipment.prototype.format.apply(this, arguments), {
            boomSuit: this.boomSuit
        });
    },
    getTarget: events('targetSelf'),
    beforeDraw: function(step, onResolved, onSkip) {
        if (!step.player.equipped.find(c => c === this)) return onResolved();

        onResolved(events('cardDraw', step.player)(
            step.player, step.phase.cards,
            card => this.handleCard(step, card, onResolved, onSkip),
            // Cannot cancel this draw
            undefined,
            // format
            () => ({
                name: 'dynamite',
                what: 'draw',
                dynamite: this.format(),
                player: step.player.name
            })
        ));
    },
    handleCard: function(step, card, onResolved, onSkip) {
        step.phase.cards.discarded.push(card);
        step.player.equipped.remove(this.id);
        if (this.shouldExplode(card)) {
            this.handleExplode(step, card, onResolved, onSkip);
        } else {
            this.handlePassed(step, card, onResolved, onSkip);
        }
    },
    shouldExplode: function(card) {
        return card.suit === this.boomSuit
            && Card.rankWithin(card.rank, this.minRank, this.maxRank);
    },
    handleExplode: function(step, card, onResolved, onSkip) {
        step.phase.cards.discarded.push(this);
        step.game.onGameEvent({
            name: 'dynamite',
            what: 'exploded',
            player: step.player.name,
            dynamite: this.format(),
            card: card.format()
        });
        handles.damage(step, undefined, step.player, 3, onResolved);
    },
    handlePassed: function(step, card, onResolved, onSkip) {
        var next = misc.after(step.game.players, step.player, p => p.alive);
        next.equipped.push(this);
        step.game.onGameEvent({
            name: 'dynamite',
            what: 'passed',
            source: step.player.name,
            target: next.name,
            dynamite: this.format(),
            card: card.format()
        });
        onResolved();
    }
});

module.exports = Dynamite;