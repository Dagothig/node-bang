'use strict';

var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function Emporio(suit, rank) {
    Card.call(this, 'emporio', suit, rank);
}
misc.extend(Card, Emporio, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        var alive = step.game.players.filter(p => p.alive);
        var current = alive[alive.indexOf(step.player)];
        var cards = step.phase.cards.draw(alive.length);

        step.game.onGameEvent({
            name: 'choice',
            for: 'emporio',
            cards: cards.map(c => c.format())
        });

        this.handleEmporio(step, alive, current, cards, onResolved);
    },
    handleEmporio: function(step, players, player, cards, onResolved) {
        if (!cards.length) return onResolved();
        onResolved(events('cardChoice')(
            player, cards,
            // onChoice
            card => {
                player.hand.add(
                    misc.remove(cards, card),
                    { from: 'choice', for: 'emporio' },
                    true // card visible to all
                );
                let next = misc.after(players, player);
                this.handleEmporio(step, players, next, cards, onResolved);
            },
            // onCancel
            undefined,
            // format
            () => ({
                what: 'choice',
                for: 'emporio',
                cards: cards.map(c => c.format())
            })
        ).truncateIfTrivial());
    }
});

module.exports = Emporio;