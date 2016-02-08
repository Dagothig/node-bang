'use strict';

var Character = aReq('server/game/characters/character');

module.exports = new Character("Suzy Lafayette", {
    afterPlay: function(step, onResolved, onSkip) {
        let suzy = step.game.players.find(p => p.character === this);

        if (!suzy.hand.length) suzy.hand.drawFromPile();
        onResolved();
    }
});