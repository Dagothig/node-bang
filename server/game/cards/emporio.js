'use strict';

var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function Emporio(suit, rank) {
    Card.call(this, 'emporio', suit, rank, Card.types.brown);
}
misc.extend(Card, Emporio, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        var alive = step.game.players.filter(p => p.alive);
        var current = alive[alive.indexOf(step.player)];
        var cards = step.phase.cards.draw(alive.length);
        this.handleEmporio(alive, current, cards, onResolved);
    },
    handleEmporio: function(players, player, cards, onResolved) {
        if (!cards.length) {
            onResolved();
            return;
        }
        onResolved(events.cardChoiceEvent(
            player, cards,
            // onChoice
            card => {
                player.hand.push(misc.remove(cards, card));
                step.game.onGameEvent({
                    name: 'Draw',
                    player: player.name,
                    card: card.format()
                });
                let next = misc.after(players, player);
                this.handleEmporio(players, next, cards, onResolved);
            },
            // onCancel
            undefined,
            // format
            () => ({
                name: 'Emporio',
                cards: cards.map(c => c.id),
                player: player.name
            })
        ));
    }
});

module.exports = Emporio;