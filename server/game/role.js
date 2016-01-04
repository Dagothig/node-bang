var misc = aReq('server/misc');

function Role(name, publicName, overrides) {
    this.name = name;
    this.publicName = publicName;
    misc.merge(this, overrides);
}

module.exports = Role;
