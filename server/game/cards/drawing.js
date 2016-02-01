var Card = aReq('server/game/cards/card'),
    misc = aReq('server/misc');

function handleDrawCard(step, card, amount) {
    step.player.hand.discard(card.id);
    step.player.hand.drawFromPile(amount);
    step.game.onGameEvent({
        name: 'Draw',
        player: step.player.name,
        amount: amount,
        card: this.id
    });
}
function Stagecoach(suit, rank) {
    Card.call(this, 'stagecoach', suit, rank, Card.types.brown);
}
misc.extend(Card, Stagecoach, {
    handlePlay: function(step, onResolved) { handleDrawCard(step, this, 2); }
});
function WellsFargo(suit, rank) {
    Card.call(this, 'wellsfargo', suit, rank, Card.types.brown);
}
misc.extend(Card, WellsFargo, {
    handlePlay: function(step, onResolved) { handleDrawCard(step, this, 3); }
});

module.exports = {
    Stagecoach: Stagecoach,
    WellsFargo: WellsFargo
};