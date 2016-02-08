'use strict';

var Character = aReq('server/game/characters/character'),

    Card = aReq('server/game/cards/card'),
    suits = Card.suits;

module.exports = new Character("Black Jack", {
    afterDraw: function(step, cards, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();

        let second = cards[1];
        step.game.onGameEvent({
            name: 'Drew',
            player: step.player.name,
            card: second.format()
        });
        if (second.suit === suits.hearts || second.suit === suits.diamonds) {
            step.player.hand.drawFromPile();
        }
        onResolved();
    }
});