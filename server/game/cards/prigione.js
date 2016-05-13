var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    roles = aReq('server/game/roles'),
    Equipment = aReq('server/game/cards/equipment');

function Prigione(suit, rank) {
    Equipment.call(this, 'prigione', suit, rank, 'prigione');
    this.releaseSuit = Card.suits.hearts;
    this.minRank = Card.ranks.ace;
    this.maxRank = Card.ranks.king;
}
misc.extend(Equipment, Prigione, {
    priority: 1,
    handleAfterPlay: function(step, onResolved, target) {
        onResolved();
        if (target === step.player) step.phase.goToNextTurn(step.game);
    },
    format: function() {
        return misc.merge(Equipment.prototype.format.apply(this, arguments), {
            releaseSuit: this.releaseSuit,
            minRank: this.minRank,
            maxRank: this.maxRank
        });
    },
    getTarget: (player, players, onTarget, onCancel, format) => events('target')(
        player,
        players.filter(p => p.alive && p.role !== roles.sheriff),
        onTarget, onCancel, format
    ),
    beforeDraw: function(step, onResolved, onSkip) {
        if (!step.player.equipped.find(c => c === this)) return onResolved();

        onResolved(events('cardDraw', step.player)(
            step.player, step.phase.cards,
            card => this.handleCard(step, card, onResolved, onSkip),
            // Cannot cancel this draw
            undefined,
            () => ({
                name: 'prigione',
                what: 'draw',
                prigione: this.format(),
                player: step.player.name
            })
        ));
    },
    handleCard: function(step, card, onResolved, onSkip) {
        step.phase.cards.discarded.push(card);
        step.player.equipped.discard(this.id);

        if (this.shouldBeReleased(card)) {
            this.handleReleased(step, card, onResolved, onSkip);
        } else {
            this.handleImprisoned(step, card, onResolved, onSkip);
        }
    },
    shouldBeReleased: function(card) {
        return card.suit === this.releaseSuit &&
            Card.rankWithin(card.rank, this.minRank, this.maxRank);
    },
    handleReleased: function(step, card, onResolved, onSkip) {
        step.game.onGameEvent({
            name: 'prigione',
            what: 'released',
            player: step.player.name,
            prigione: this.format(),
            card: card.format()
        });
        onResolved();
    },
    handleImprisoned: function(step, card, onResolved, onSkip) {
        step.game.onGameEvent({
            name: 'prigione',
            what: 'imprisoned',
            player: step.player.name,
            prigione: this.format(),
            card: card.format()
        });
        step.phase.goToNextTurn(step.game);
    }
});

module.exports = Prigione;