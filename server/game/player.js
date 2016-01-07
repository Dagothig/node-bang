var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn');

function Player(user) {
    this.user = user;
}

module.exports = Player;