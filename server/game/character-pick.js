var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts'),

    actions = aReq('server/actions'),

    Phase = aReq('server/game/phase'),
    RolePick = aReq('server/game/role-pick');

module.exports = new Phase('Character pick', {

    startTimer: function startTimer(game, time) {
        this.stopTimer();
        this.remainingTime = time;
        this.remainingInterval = setInterval(() => {
            if (--this.remainingTime > 0) game.onGameUpdate();
            else game.switchToPhase(RolePick);
        }, 1000);
    },

    stopTimer: function stopTimer() {
        if (this.remainingInterval) {
            clearInterval(this.remainingInterval);
            delete this.remainingInterval;
            delete this.remainingTime;
        }
    },

    begin: function begin(game) {
        var chars = aReq('server/game/characters').slice();
        game.players.forEach(p => {
            p.characters = misc.gen(() => misc.spliceRand(chars), consts.characterChoices);
        });

        this.startTimer(game, consts.characterPickMaxTime);
    },

    end: function end(game) {
        game.players.filter(p => !p.character).forEach(p => {
            p.character = misc.spliceRand(p.characters);
        });

        game.players.forEach((player) => {
            delete player.characters;
            log(player.user.name, 'is', player.character.name);
        });

        this.stopTimer();
    },

    actionsFor: function actionsFor(game, player) {
        if (!player) return {};
        var acts = {};
        acts[actions.select] = player.characters.map(character => character.name);
        return acts;
    },

    handleAction: function handleAction(game, player, msg) {
        if (!player || msg.action !== actions.select) return;
        player.character =
            player.characters.find((c) => c.name === msg.arg)
            || player.character;
        this.checkForEnd(game);
    },

    format: function format(game, player, formatted) {
        formatted.remainingTime = this.remainingTime;
        return formatted;
    },

    formatPlayer: (game, player, other, formatted) => formatted,

    checkForEnd: function checkForEnd(game) {
        var unchosen = game.players.filter((player) => !player.character);
        if (!unchosen.length) this.startTimer(Math.min(3, this.remainingTime));
    }
});
