'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    suits = Card.suits,
    Barile = aReq('server/game/cards/barile');

module.exports = new Character("Jourdonnais", {
    permaBarile: new Barile(undefined, undefined, suits.hearts),
    beforeBangResponse: function(step, card, target, onResolved, onSkip) {
        if (target.character !== this) return onResolved();

        return this.permaBarile
            .beforeBangResponse(step, card, target, onResolved, onSkip);
    }
});