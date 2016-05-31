'use strict';

var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function Panico(suit, rank) {
    Card.call(this, 'panico', suit, rank);
}
misc.extend(Card, Panico, {
    handlePlay: function(step, onResolved) {
        let player = step.player;
        let alive = step.game.players.filter(p => p.alive);
        let range = player.stat('range');
        onResolved(events('removeOtherCard')(
            player, alive.filter(p => player.distanceTo(alive, p) <= range),
            // withHand
            true,
            // withEquipment
            true,
            // onChoice
            (target, from, card) =>
                this.handleCard(step, target, from, card, onResolved),
            // onCancel; panico wasn't used
            () => onResolved(),
            // format
            p => ({ for: (p === step.player) ? 'panico' : '' })
        ));
    },
    handleCard: function(step, target, from, card, onResolved) {
        step.player.hand.push(card);
        step.player.hand.discard(this.id);

        let specific = {
            name: 'draw',
            from: from,
            player: step.player.name,
            target: target.name,
            card: card.format()
        };
        let unspecific = {
            name: 'draw',
            from: from,
            player: step.player.name,
            target: target.name,
            amount: 1
        };
        step.game.onGameEvent(player =>
            (player === step.player || player === target) ? specific : unspecific
        );

        onResolved();
    }
});

module.exports = Panico;