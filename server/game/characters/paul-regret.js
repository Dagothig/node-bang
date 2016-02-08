'use strict';

var Character = aReq('server/game/characters/character');

module.exports = new Character("Paul Regret", {
    lifeModifier: -1,
    initCardsModifier: -1,
    distanceModifier: 1
});