var Card = aReq('server/game/cards/card');

var suits = Card.suits, ranks = Card.ranks;

var attacking = aReq('server/game/cards/attacking'),
    simpleEquipment = aReq('server/game/cards/simple-equipment'),
    healing = aReq('server/game/cards/healing'),
    drawing = aReq('server/game/cards/drawing');

var Bang = attacking.Bang,
    Mancato = attacking.Mancato,
    Gatling = attacking.Gatling,
    Indians = attacking.Indians,
    Beer = healing.Beer,
    Saloon = healing.Saloon,
    Stagecoach = drawing.Stagecoach,
    WellsFargo = drawing.WellsFargo,
    Emporio = aReq('server/game/cards/emporio'),
    Panico = aReq('server/game/cards/panico'),
    CatBalou = aReq('server/game/cards/cat-balou'),
    Duel = aReq('server/game/cards/duel'),
    Volcanic = simpleEquipment.Volcanic,
    Schofield = simpleEquipment.Schofield,
    Remington = simpleEquipment.Remington,
    Carabine = simpleEquipment.Carabine,
    Winchester = simpleEquipment.Winchester,
    Mustang = simpleEquipment.Mustang,
    Mirino = simpleEquipment.Mirino,
    Barile = aReq('server/game/cards/barile'),
    Prigione = aReq('server/game/cards/prigione'),
    Dynamite = aReq('server/game/cards/dynamite');

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
    new Duel(suits.hearts, ranks.four),

    new Volcanic(suits.hearts, ranks.ace),
    new Volcanic(suits.hearts, ranks.two),
    new Schofield(suits.hearts, ranks.three),
    new Schofield(suits.hearts, ranks.four),
    new Remington(suits.hearts, ranks.five),
    new Remington(suits.hearts, ranks.six),
    new Carabine(suits.hearts, ranks.seven),
    new Carabine(suits.hearts, ranks.eight),
    new Winchester(suits.hearts, ranks.nine),
    new Winchester(suits.hearts, ranks.ten),

    new Mustang(suits.hearts, ranks.ace),
    new Mustang(suits.hearts, ranks.two),
    new Mustang(suits.hearts, ranks.three),

    new Mirino(suits.hearts, ranks.ace),
    new Mirino(suits.hearts, ranks.two),

    new Barile(suits.hearts, ranks.ace, suits.hearts),
    new Barile(suits.hearts, ranks.two, suits.hearts),
    new Barile(suits.hearts, ranks.three, suits.hearts),

    new Prigione(suits.hearts, ranks.ace, suits.hearts, ranks.ace, ranks.ten),
    new Prigione(suits.hearts, ranks.two, suits.hearts, ranks.ace, ranks.ten),
    new Prigione(suits.hearts, ranks.three, suits.hearts, ranks.ace, ranks.ten),
    new Prigione(suits.hearts, ranks.four, suits.hearts, ranks.ace, ranks.ten),

    new Dynamite(suits.hearts, ranks.ace, suits.hearts, ranks.ace, ranks.ten),
    new Dynamite(suits.hearts, ranks.two, suits.hearts, ranks.ace, ranks.ten),
    new Dynamite(suits.hearts, ranks.three, suits.hearts, ranks.ace, ranks.ten),
    new Dynamite(suits.hearts, ranks.four, suits.hearts, ranks.ace, ranks.ten)
];

module.exports = cards;