var misc = aReq('server/misc');

function Character(name, overrides) {
    this.name = name;

    misc.merge(this, overrides);
}

module.exports = Character;
