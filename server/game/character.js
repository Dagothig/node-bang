var misc = aReq('server/misc');

function Character(name, overrides) {
    this.name = name;
    misc.merge(this, {
        lifeMax: 4,
        distanceModifier: 0,
    rangeModifier: 0,
        bangsMax: 1
    }, overrides);
}

module.exports = Character;
