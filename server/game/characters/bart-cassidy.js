'use strict';

var Character = aReq('server/game/characters/character');

module.exports = new Character("Bart Cassidy", {
    afterDamage: function(step, source, target, amount, onResolved, onSkip) {
        if (target.character !== this) return onResolved();
        target.hand.drawFromPile(amount);
        onResolved();
    }
});