var Card = aReq('server/game/cards/card'),
    misc = aReq('server/misc');

function handleDrawCard(step, card, amount, onResolved) {
    step.player.hand.discard(card.id);
    step.player.hand.drawFromPile(amount);
    onResolved();
}

function Diligenza(suit, rank) {
    Card.call(this, 'diligenza', suit, rank);
}
misc.extend(Card, Diligenza, {
    handlePlay: function(step, onResolved) {
        handleDrawCard(step, this, 2, onResolved);
    }
});

function WellsFargo(suit, rank) {
    Card.call(this, 'wellsfargo', suit, rank);
}
misc.extend(Card, WellsFargo, {
    handlePlay: function(step, onResolved) {
        handleDrawCard(step, this, 3, onResolved);
    }
});

module.exports = {
    Diligenza: Diligenza,
    WellsFargo: WellsFargo
};