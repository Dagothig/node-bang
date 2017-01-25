var misc = aReq('server/misc');

function Character(name, overrides) {
    this.name = name;

    misc.merge(this, overrides);
}
misc.merge(Character.prototype, {
    format: function() {
        return {
            name: this.name
        };
    }
});

module.exports = Character;