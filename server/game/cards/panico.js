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
            true, true, // with hand & equipment
            (target, from, card) => { // onChoice
                player.hand.discard(this.id);
                player.hand.add(card, { from: from, target: target.name });
                onResolved();
            },
            onResolved, // onCancel; panico wasn't used
            p => ({ for: (p === player) ? 'panico' : '' }) // format
        ));
    }
});

module.exports = Panico;