var Card = aReq('server/game/card'),
    cardTypes = aReq('server/game/card-types');

var suits = Card.suits, ranks = Card.ranks;

var Bang = cardTypes.Bang,
    Mancato = cardTypes.Mancato,
    Beer = cardTypes.Beer,
    Saloon = cardTypes.Saloon,
    Stagecoach = cardTypes.Stagecoach,
    WellsFargo = cardTypes.WellsFargo,
    Emporio = cardTypes.Emporio,
    Gatling = cardTypes.Gatling,
    Indians = cardTypes.Indians,
    Panico = cardTypes.Panico,
    CatBalou = cardTypes.CatBalou,
    Duel = cardTypes.Duel;

var cards = [
    new Bang(suits.diamonds, ranks.ace),
    new Bang(suits.diamonds, ranks.two),
    new Bang(suits.diamonds, ranks.three),
    new Bang(suits.diamonds, ranks.four),
    new Bang(suits.diamonds, ranks.five),
    new Bang(suits.diamonds, ranks.six),
    new Bang(suits.diamonds, ranks.seven),
    new Bang(suits.diamonds, ranks.eight),
    new Bang(suits.diamonds, ranks.nine),
    new Bang(suits.diamonds, ranks.ten),
    new Bang(suits.diamonds, ranks.jack),
    new Bang(suits.diamonds, ranks.queen),
    new Bang(suits.diamonds, ranks.king),

    new Bang(suits.clovers, ranks.two),
    new Bang(suits.clovers, ranks.three),
    new Bang(suits.clovers, ranks.five),
    new Bang(suits.clovers, ranks.four),
    new Bang(suits.clovers, ranks.six),
    new Bang(suits.clovers, ranks.seven),
    new Bang(suits.clovers, ranks.eight),
    new Bang(suits.clovers, ranks.nine),

    new Bang(suits.hearts, ranks.ace),
    new Bang(suits.hearts, ranks.queen),
    new Bang(suits.hearts, ranks.king),

    new Bang(suits.spades, ranks.ace),

    new Mancato(suits.spades, ranks.ace),
    new Mancato(suits.spades, ranks.two),
    new Mancato(suits.spades, ranks.three),
    new Mancato(suits.spades, ranks.four),
    new Mancato(suits.spades, ranks.five),
    new Mancato(suits.spades, ranks.six),

    new Mancato(suits.spades, ranks.seven),
    new Mancato(suits.spades, ranks.eight),
    new Mancato(suits.spades, ranks.nine),
    new Mancato(suits.spades, ranks.ten),
    new Mancato(suits.spades, ranks.jack),
    new Mancato(suits.spades, ranks.queen),

    new Beer(suits.hearts, ranks.ace),
    new Beer(suits.hearts, ranks.two),
    new Beer(suits.hearts, ranks.three),
    new Beer(suits.hearts, ranks.four),

    new Saloon(suits.hearts, ranks.five),
    new Saloon(suits.hearts, ranks.six),

    new Stagecoach(suits.hearts, ranks.seven),
    new Stagecoach(suits.hearts, ranks.eight),

    new WellsFargo(suits.hearts, ranks.nine),
    new WellsFargo(suits.hearts, ranks.ten),

    new Emporio(suits.hearts, ranks.jack),
    new Emporio(suits.hearts, ranks.queen),
    new Emporio(suits.hearts, ranks.king),

    new Gatling(suits.hearts, ranks.ace),
    new Gatling(suits.hearts, ranks.two),

    new Indians(suits.hearts, ranks.ace),
    new Indians(suits.hearts, ranks.two),

    new Panico(suits.hearts, ranks.ace),
    new Panico(suits.hearts, ranks.two),

    new CatBalou(suits.hearts, ranks.ace),
    new CatBalou(suits.hearts, ranks.two),

    new Duel(suits.hearts, ranks.ace),
    new Duel(suits.hearts, ranks.two),
    new Duel(suits.hearts, ranks.three),
    new Duel(suits.hearts, ranks.four)
];

module.exports = cards;