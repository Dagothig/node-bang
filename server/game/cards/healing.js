var Card = aReq('server/game/cards/card'),
    misc = aReq('server/misc');

function Beer(suit, rank) {
    Card.call(this, 'beer', suit, rank);
}
misc.extend(Card, Beer, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        step.player.heal(1);
        step.game.onGameEvent({
            name: 'beer',
            player: step.player.name,
            card: this.id
        });
        onResolved();
    }
});

function Saloon(suit, rank) {
    Card.call(this, 'saloon', suit, rank);
}
misc.extend(Card, Saloon, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        step.game.players
            .filter(p => p.alive)
            .forEach(p => p.heal(1));
        step.game.onGameEvent({
            name: 'saloon',
            player: step.player.name,
            card: this.id
        });
        onResolved();
    }
});

module.exports = {
    Beer: Beer,
    Saloon: Saloon
};
