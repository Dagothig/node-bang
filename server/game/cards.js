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

    new Mancato(suits.spades, ranks.two),
    new Mancato(suits.spades, ranks.four),
    new Mancato(suits.spades, ranks.five),
    new Mancato(suits.spades, ranks.six),
    new Mancato(suits.spades, ranks.seven),
    new Mancato(suits.spades, ranks.eight),

    new Mancato(suits.clovers, ranks.three),
    new Mancato(suits.clovers, ranks.ten),
    new Mancato(suits.clovers, ranks.jack),
    new Mancato(suits.clovers, ranks.king),
    new Mancato(suits.clovers, ranks.queen),
    new Mancato(suits.clovers, ranks.ace),
    
    new Beer(suits.hearts, ranks.six),
    new Beer(suits.hearts, ranks.seven),
    new Beer(suits.hearts, ranks.eight),
    new Beer(suits.hearts, ranks.nine),
    new Beer(suits.hearts, ranks.ten),
    new Beer(suits.hearts, ranks.jack),

    new Saloon(suits.hearts, ranks.five),

    new Stagecoach(suits.spades, ranks.nine),
    new Stagecoach(suits.spades, ranks.nine),

    new WellsFargo(suits.hearts, ranks.three),

    new Emporio(suits.clovers, ranks.nine),
    new Emporio(suits.spades, ranks.queen),
    new Emporio(suits.spades, ranks.ace),

    new Gatling(suits.hearts, ranks.ten),

    new Indians(suits.diamonds, ranks.ace),
    new Indians(suits.diamonds, ranks.king),

    new Panico(suits.spades, ranks.eight),
    new Panico(suits.hearts, ranks.jack),
    new Panico(suits.hearts, ranks.queen),
    new Panico(suits.hearts, ranks.ace),

    new CatBalou(suits.hearts, ranks.king),
    new CatBalou(suits.diamonds, ranks.nine),
    new CatBalou(suits.diamonds, ranks.ten),
    new CatBalou(suits.diamonds, ranks.jack),

    new Duel(suits.diamonds, ranks.queen),
    new Duel(suits.diamonds, ranks.jack),
    new Duel(suits.clovers, ranks.eight),

    new Volcanic(suits.spades, ranks.ten),
    new Volcanic(suits.clovers, ranks.ten),
    new Schofield(suits.clovers, ranks.jack),
    new Schofield(suits.clovers, ranks.queen),
    new Schofield(suits.spades, ranks.king),
    new Remington(suits.clovers, ranks.king),
    new Carabine(suits.clovers, ranks.ace),
    new Winchester(suits.spades, ranks.eight),

    new Mustang(suits.hearts, ranks.eight),
    new Mustang(suits.hearts, ranks.nine),
    new Mustang(suits.hearts, ranks.five),

    new Mirino(suits.spades, ranks.ace),

    new Barile(suits.spades, ranks.king, suits.hearts),
    new Barile(suits.spades, ranks.queen, suits.hearts),

//prigione should always release on hearts suit, so this is a duck tape fix :D
    new Prigione(suits.hearts, ranks.four, suits.hearts, ranks.two, ranks.ace),
    new Prigione(suits.spades, ranks.jack, suits.hearts, ranks.two, ranks.ace),
    new Prigione(suits.spades, ranks.queen, suits.hearts, ranks.two, ranks.ace),

    new Dynamite(suits.hearts, ranks.two, suits.spades, ranks.two, ranks.nine),
];

module.exports = cards;
