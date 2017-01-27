'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character');

module.exports = new Character("El Gringo", {
    lifeModifier: -1,
    initCardsModifier: -1,
    afterDamage: function(step, source, target, amount, onResolved, onSkip) {
        if (target.character !== this || !source || !source.hand.cardCount)
            return onResolved();
        target.hand.add(
            source.hand.removeRand(),
            { from: 'hand', target: source.name }
        );
    }
});