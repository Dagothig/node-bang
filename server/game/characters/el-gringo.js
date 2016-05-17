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
            if (card) { target.hand.push(card);
                // TODO; don't reveal the id of the card
                step.game.onGameEvent({
                    name: 'draw',
                    from: 'hand',
                    player: target.name,
                    target: source.name,
                    card: card.format()
                });
            }
        }

        onResolved();
    }
});