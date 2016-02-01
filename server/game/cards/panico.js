var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function Panico(suit, rank) {
    Card.call(this, 'panico', suit, rank, Card.types.brown);
}
misc.extend(Card, Panico, {
    handlePlay: function(step, onResolved) {
        onResolved(events.TargetRange(
            step.player, step.game.players, step.player.stat('range'),
            // onTarget; panicking someone
            target => onResolved(events.RemoveOtherCard(
                step.player, target, true, true,
                card => this.handleCard(step, target, card, onResolved),
                // onCancel; the panico was not used
                () => onResolved()
            )),
            // onCancel; the panico was not used
            () => onResolved()
        ));
    },
    handleCard: function(step, target, card, onResolved) {
        step.player.hand.discard(this.id);
        step.player.hand.push(card);
        step.game.onGameEvent({
            name: 'Panico',
            thief: step.player.name,
            player: target.name
        });
        onResolved();
    }
});

module.exports = Panico;