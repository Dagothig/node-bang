var Character = aReq('server/game/character');

var characters = [
    new Character("Bart Cassidy", {

    }),

    new Character("Black Jack", {

    }),

    new Character("Calamity Janet", {

    }),

    new Character("El Gringo", {

    }),

    new Character("Jesse Jones", {

    }),

    new Character("Jourdonnais", {

    }),

    new Character("Kit Carlson", {

    }),

    new Character("Lucky Duke", {

    }),

    new Character("Paul Regret", {
        lifeModifier: -1,
        initCardsModifier: -1,
        distanceModifier: 1
    }),

    new Character("Pedro Ramirez", {

    }),

    new Character("Rose Doolan", {
        rangeModifider: 1
    }),

    new Character("Sid Ketchum", {

    }),

    new Character("Slab the Killer", {

    }),

    new Character("Suzy Lafayette", {

    }),

    new Character("Vulture Sam", {

    }),

    new Character("Willy the Kid", {
        bangsModifier: 1000
    })
];

module.exports = characters;
