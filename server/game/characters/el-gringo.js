'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character');

module.exports = new Character("El Gringo", {
    lifeModifier: -1,
    initCardsModifier: -1,
    afterDamage: function(step, source, target, amount, onResolved, onSkip) {
        if (target.character !== this) return onResolved();

        if (source) {
            let card = misc.spliceRand(source.hand);
            if (card) target.hand.push(card);
            step.game.onGameEvent({
                name: 'Steal',
                thief: target.name,
                player: source.name
            });
        }

        onResolved();
    }
});