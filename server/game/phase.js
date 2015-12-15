var misc = require('../misc.js'),
    log = require('../log.js'),
    warn = require('../warn.js');

function Phase(name, obj) {
    var warnMissing = (key) => warn('Phase', '"' + name + '"', 'does not handle', '"' + key + '"');
    var defineIfMissing = (key, func) => {
        if (this[key]) return;
        warnMissing(key);
        this[key] = func;
    };
    Object.assign(this, obj);
    this.name = name;
    defineIfMissing('begin', (game) => {});
    defineIfMissing('end', (game) => {});
    defineIfMissing('actionsFor', (game, user) => ({}));
    defineIfMissing('handleAction', (game, user, msg) => {});
    defineIfMissing('format', (game, formatted) => formatted);
}

module.exports = Phase;
