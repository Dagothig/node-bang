'use strict';

var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function Panico(suit, rank) {
    Card.call(this, 'panico', suit, rank);
}
misc.extend(Card, Panico, {
    handlePlay: function(step, onResolved) {
        onResolved(events('targetRange')(
            step.player, step.game.players, step.player.stat('range'),
            // onTarget; panicking someone
            target => onResolved(events('removeOtherCard')(
                step.player, target, true, true,
                // onPlay; the panico was used and we have gained a card
                (from, card) =>
                    this.handleCard(step, target, from, card, onResolved),
                // onCancel; the panico was not used
                () => onResolved()
            )),
            // onCancel; the panico was not used
            () => onResolved()
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