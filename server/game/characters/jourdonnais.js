'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    Card = aReq('server/game/cards/card'),
    suits = Card.suits,
    Barile = aReq('server/game/cards/barile');

module.exports = new Character("Jourdonnais", {
    barile: new Barile(),
    beforeBangResponse: function(step, card, target, attack, onResolved, onSkip) {
        return target.character === this ?
            this.barile.tryAvoid(
                step, card, target, attack, onResolved, onSkip
            ) :
            onResolved();
    }
});