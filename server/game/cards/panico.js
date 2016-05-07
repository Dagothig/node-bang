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
                card => this.handleCard(step, target, card, onResolved),
                // onCancel; the panico was not used
                () => onResolved()
            )),
            // onCancel; the panico was not used
            () => onResolved()
        ));
    },
    handleCard: function(step, target, card, onResolved) {
        step.player.hand.push(card);
        step.player.hand.discard(this.id);
        step.game.onGameEvent({
            name: 'Panico',
            thief: step.player.name,
            player: target.name
        });
        onResolved();
    }
});

module.exports = Panico;