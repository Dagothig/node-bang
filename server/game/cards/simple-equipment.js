var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    Equipment = aReq('server/game/cards/equipment');

// === Guns === //

function Volcanic(suit, rank) {
    Equipment.call(this, 'volcanic', suit, rank, 'weapon');
}
misc.extend(Equipment, Volcanic, { bangsModifier: 1000 });

function Schofield(suit, rank) {
    Equipment.call(this, 'schofield', suit, rank, 'weapon');
}
misc.extend(Equipment, Schofield, { bangRangeModifier: 1 });

function Remington(suit, rank) {
    Equipment.call(this, 'remington', suit, rank, 'weapon');
}
misc.extend(Equipment, Remington, { bangRangeModifier: 2 });

function Carabine(suit, rank) {
    Equipment.call(this, 'carabine', suit, rank, 'weapon');
}
misc.extend(Equipment, Remington, { bangRangeModifier: 3 });

function Winchester(suit, rank) {
    Equipment.call(this, 'winchester', suit, rank, 'weapon');
}
misc.extend(Equipment, Remington, { bangRangeModifier: 4 });

// === Others === //

function Mustang(suit, rank) {
    Equipment.call(this, 'mustang', suit, rank, 'mustang');
}
misc.extend(Equipment, Mustang, {
    getTarget: events.TargetSelf,
    distanceModifier: 1
});

function Mirino(suit, rank) {
    Equipment.call(this, 'mirino', suit, rank, 'mirino');
}
misc.extend(Equipment, Mirino, {
    getTarget: events.TargetSelf,
    bangRangeModifier: 1,
    rangeModifier: 1
});

module.exports = {
    Volcanic: Volcanic,
    Schofield: Schofield,
    Remington: Remington,
    Carabine: Carabine,
    Winchester: Winchester,
    Mustang: Mustang,
    Mirino: Mirino
};