var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    roles = aReq('server/game/roles'),
    Equipment = aReq('server/game/cards/equipment');

function Prigione(suit, rank, releaseSuit, minRank, maxRank) {
    Equipment.call(this, 'prigione', suit, rank, 'prigione');
    this.releaseSuit = releaseSuit;
    this.minRank = minRank;
    this.maxRank = maxRank;
}
misc.extend(Equipment, Prigione, {
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
                name: 'Prigione',
                what: 'Draw',
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
            name: 'Prigione',
            what: 'released',
            player: step.player.name,
            prigione: this.format(),
            card: card.format()
        });
        onResolved();
    },
    handleImprisoned: function(step, card, onResolved, onSkip) {
        step.game.onGameEvent({
            name: 'Prigione',
            what: 'Imprisoned',
            player: step.player.name,
            prigione: this.format(),
            card: card.format()
        });
        step.phase.goToNextTurn(step.game);
    }
});

module.exports = Prigione;