'use strict';

var Character = aReq('server/game/characters/character');

module.exports = new Character("Willy the Kid", {
    bangsModifier: 1000
});