var misc = require('../misc.js'),
    log = require('../log.js'),
    warn = require('../warn.js'),
    consts = require('../../shared/consts.js'),

    actions = require('../../shared/actions.js'),
    characters = require('./characters.js'),

    Phase = require('./phase.js'),
    RolePick = require('./role-pick.js');

module.exports = new Phase('Character pick', {
    begin: function begin(game) {
        var chars = characters.slice();
        game.players.forEach((player) =>
            player.characters = misc.gen(() => misc.spliceRand(chars), consts.characterChoices)
        );

        this.remainingTime = consts.characterPickMaxTime;
        this.remainingInterval = setInterval(() => {
            if (--this.remainingTime) game.onGameUpdate();
            else game.switchToPhase(RolePick);
        }, 1000);
    },
    end: function end(game) {
        game.players.filter(p => !p.character).forEach((p) => {
            p.character = misc.spliceRand(p.characters);
        });
        game.players.forEach((player) => {
            delete player.characters;
            log(player.user.name, 'is', player.character.name);
        });
        if (this.remainingInterval) {
            clearInterval(this.remainingInterval);
            this.remainingInterval = null;
            this.remainingTime = null;
        }
    },
    actionsFor: function actionsFor(game, user) {
        var player = game.findPlayer(user);
        if (!player) return {};
        var acts = {};
        acts[actions.select] = player.characters.map((character) => character.name);
        return acts;
    },
    handleAction: function handleAction(game, user, msg) {
        var player = game.findPlayer(user);
        if (!player) return;
        switch (msg.action) {
            case actions.select:
                var character = player.characters.find((character) => character.name === msg.arg);
                if (character) player.character = character;
                this.checkForEnd(game);
                break;
            default:
                return;
        }
    },
    format: function format(game, formatted) {
        formatted.remainingTime = this.remainingTime;
        return formatted;
    },
    checkForEnd: function checkForEnd(game) {
        var unchosen = game.players.filter((player) => !player.character);
        if (!unchosen.length) this.remainingTime = Math.min(this.remainingTime, 3);
    }
});
