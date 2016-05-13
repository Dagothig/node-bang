var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function CatBalou(suit, rank) {
    Card.call(this, 'catbalou', suit, rank);
}
misc.extend(Card, CatBalou, {
    handlePlay: function(step, onResolved) {
        onResolved(events('targetOthers')(
            step.player, step.game.players,
            // onTarget; removing someone's card
            target => {
                onResolved(events('removeOtherCard')(
                    step.player, target, true, true,
                    (from, card) => {
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
                    // on cancel; the cat-balou was not used
                    () => onResolved()
                ))
            },
            // onCancel; the catbalou was not used
            () => onResolved()
        ));
    }
});

module.exports = CatBalou;