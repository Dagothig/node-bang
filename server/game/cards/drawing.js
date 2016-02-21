var Card = aReq('server/game/cards/card'),
    misc = aReq('server/misc');

function handleDrawCard(step, card, amount, onResolved) {
    step.player.hand.discard(card.id);
    step.player.hand.drawFromPile(amount);
    onResolved();
}

function Stagecoach(suit, rank) {
    Card.call(this, 'stagecoach', suit, rank, Card.types.brown);
}
misc.extend(Card, Stagecoach, {
    handlePlay: function(step, onResolved) { handleDrawCard(step, this, 2, onResolved); }
});

function WellsFargo(suit, rank) {
    Card.call(this, 'wellsfargo', suit, rank, Card.types.brown);
}
misc.extend(Card, WellsFargo, {
    handlePlay: function(step, onResolved) { handleDrawCard(step, this, 3, onResolved); }
});

module.exports = {
    Stagecoach: Stagecoach,
    WellsFargo: WellsFargo
};