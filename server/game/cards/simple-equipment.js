var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    Equipment = aReq('server/game/cards/equipment');

// === Guns === //

function Gun(name, suit, rank) {
    Equipment.call(this, name, suit, rank, 'weapon');
}
misc.extend(Equipment, Gun, { getTarget: events('targetSelf') });

function Volcanic(suit, rank) {
    Gun.call(this, 'volcanic', suit, rank);
}
misc.extend(Gun, Volcanic, { bangsModifier: 1000 });

function Schofield(suit, rank) {
    Gun.call(this, 'schofield', suit, rank);
}
misc.extend(Gun, Schofield, { bangRangeModifier: 1 });

function Remington(suit, rank) {
    Gun.call(this, 'remington', suit, rank);
}
misc.extend(Gun, Remington, { bangRangeModifier: 2 });

function Carabine(suit, rank) {
    Gun.call(this, 'carabine', suit, rank);
}
misc.extend(Gun, Carabine, { bangRangeModifier: 3 });

function Winchester(suit, rank) {
    Gun.call(this, 'winchester', suit, rank);
}
misc.extend(Gun, Winchester, { bangRangeModifier: 4 });

// === Others === //

function Mustang(suit, rank) {
    Equipment.call(this, 'mustang', suit, rank, 'mustang');
}
misc.extend(Equipment, Mustang, {
    getTarget: events('targetSelf'),
    distanceModifier: 1
});

function Mirino(suit, rank) {
    Equipment.call(this, 'mirino', suit, rank, 'mirino');
}
misc.extend(Equipment, Mirino, {
    getTarget: events('targetSelf'),
    bangRangeModifier: 1,
    rangeModifier: 1
});

module.exports = {
    Gun: Gun,
    Volcanic: Volcanic,
    Schofield: Schofield,
    Remington: Remington,
    Carabine: Carabine,
    Winchester: Winchester,
    Mustang: Mustang,
    Mirino: Mirino
};