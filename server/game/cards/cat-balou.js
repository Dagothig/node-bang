var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function CatBalou(suit, rank) {
    Card.call(this, 'catbalou', suit, rank);
}
misc.extend(Card, CatBalou, {
    handlePlay: function(step, onResolved) {
        onResolved(events('removeOtherCard')(
            step.player,
            step.game.players.filter(p => p.alive),
            // withHand
            true,
            // withEquipment
            true,
            // onChoice
            (target, from, card) => {
                step.player.hand.discard(this.id);
                step.phase.cards.discarded.push(card);
                step.game.onGameEvent({
                    name: 'discard',
                    from: from,
                    player: target.name,
                    card: card.format()
                });
                onResolved();
            },
            // onCancel; cat-balou wasn't used
            () => onResolved(),
            // format
            p => ({ for: (p === step.player) ? 'catbalou' : '' })
        ));
    }
});

module.exports = CatBalou;