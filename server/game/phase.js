var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn');

function Phase(name, obj) {
    this.name = name;
    misc.merge(this, obj);
    (defaults => {
        for (var key in defaults) {
            if (this[key]) continue;
            warn('Phase', '"' + name + '"', 'does not handle', '"' + key + '"');
            this[key] = defaults[key];
        }
    }) ({
        begin: game => {},
        update: (game, delta) => {},
        end: game => {},
        actionsFor: (game, player) => ({}),
        handleAction: (game, player, msg) => {},
        handleDisconnect: (game, player) => {},
        format: (game, player, formatted) => formatted,
        formatPlayer: (game, player, other, formatted) => formatted
    });
}

module.exports = Phase;