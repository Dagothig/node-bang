var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn');

function Player(user) {
    this.user = user;
}
misc.merge(Player.prototype, {
    get name() { return this.user.name; }
});

module.exports = Player;