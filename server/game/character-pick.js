var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts'),

    actions = aReq('server/actions'),

    Phase = aReq('server/game/phase'),
    RolePick = aReq('server/game/role-pick');

module.exports = new Phase('Character pick', {

    startTimer: function(game, time) {
        this.stopTimer();
        this.remainingTime = time;
        this.remainingInterval = setInterval(() => {
            if (--this.remainingTime > 0) game.onGameUpdate();
            else game.switchToPhase(RolePick);
        }, 1000);
    },

    stopTimer: function() {
        if (this.remainingInterval) {
            clearInterval(this.remainingInterval);
            delete this.remainingInterval;
            delete this.remainingTime;
        }
    },

    begin: function(game) {
        var chars = aReq('server/game/characters').slice();
        game.players.forEach(p => {
            p.characters = misc.gen(() => misc.spliceRand(chars), consts.characterChoices);
        });

        this.startTimer(game, consts.characterPickMaxTime);
    },

    end: function(game) {
        game.players.filter(p => !p.character).forEach(p => {
            p.character = misc.spliceRand(p.characters);
        });

        game.players.forEach((player) => {
            delete player.characters;
            log(player.user.name, 'is', player.character.name);
        });

        this.stopTimer();
    },

    actionsFor: function(game, player) {
        if (!player) return {};
        var acts = {};
        acts[actions.select] = player.characters.map(character => character.name);
        return acts;
    },

    handleAction: function(game, player, msg) {
        if (!player || msg.action !== actions.select) return;
        player.character =
            player.characters.find((c) => c.name === msg.arg)
            || player.character;
        this.checkForEnd(game);
    },

    handleDisconnect: function(game, player) {
        game.players.splice(game.players.indexOf(player), 1);
        if (game.players.length < consts.minPlayers) game.end();
        else game.onGameUpdate();
    },

    format: function(game, player, formatted) {
        formatted.remainingTime = this.remainingTime;
        return formatted;
    },

    formatPlayer: (game, player, other, formatted) => formatted,

    checkForEnd: function(game) {
        var unchosen = game.players.filter((player) => !player.character);
        if (!unchosen.length) this.startTimer(game, Math.min(3, this.remainingTime));
    }
});
