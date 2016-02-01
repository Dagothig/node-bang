var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function CatBalou(suit, rank) {
    Card.call(this, 'catbalou', suit, rank, Card.types.brown);
}
misc.extend(Card, CatBalou, {
    handlePlay: function(step, onResolved) {
        onResolved(events.TargetOthers(
            step.player, step.game.players,
            // onTarget; removing someone's card
            target => onResolved(events.RemoveOtherCard(
                step.player, target, true, true,
                card => {
                    step.player.hand.discard(this.id);
                    step.phase.cards.discarded.push(card);
                    onResolved();
                },
                // no choice; cancel
                () => onResolved()
            )),
            // onCancel; the catbalou was not used
            () => onResolved()
        ));
    }
});

module.exports = CatBalou;