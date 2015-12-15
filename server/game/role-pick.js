var misc = require('../misc.js'),
    log = require('../log.js'),
    warn = require('../warn.js'),
    consts = require('../../shared/consts.js'),

    actions = require('../../shared/actions.js'),
    roles = require('./roles.js'),

    Phase = require('./phase.js'),
    Playing = require('./playing.js');

module.exports = new Phase('Role pick', {
    begin: function begin(game) {
        // We "support" roles for as low as 1 player for debugging purposes
        var r = [roles.sheriff];
        if (game.players.length >= 2) r.push(roles.renegade);
        if (game.players.length >= 3) r.push(roles.outlaw);
        if (game.players.length >= 4) r.push(roles.outlaw);
        if (game.players.length >= 5) r.push(roles.deputy);
        if (game.players.length >= 6) r.push(roles.outlaw);
        if (game.players.length >= 7) r.push(roles.deputy);
        game.players.forEach((player) => {
            player.role = misc.spliceRand(r);
            log(player.user.name, 'is', player.role.name);
        });

        this.remainingTime = consts.rolePickMaxTime;
        this.remainingInterval = setInterval(() => {
            if (--this.remainingTime) game.onGameUpdate();
            else game.switchToPhase(Playing);
        }, 1000);
    },
    end: function end(game) {
        game.players.forEach((player) => {
            delete player.confirmedRole;
        });
        if (this.remainingInterval) {
            clearInterval(this.remainingInterval);
            this.remainingInterval = null;
            this.remainingTime = null;
        }
    },
    actionsFor: function actionsFor(game, user) {
        var player = game.findPlayer(user), acts = {};
        if (!player) return acts;
        if (!player.confirmedRole) acts[actions.confirm] = [actions.confirm];
        return acts;
    },
    handleAction: function handleAction(game, user, msg) {
        var player = game.findPlayer(user);
        if (!player) return;
        switch (msg.action) {
            case actions.confirm:
            player.confirmedRole = true;
            this.checkForEnd(game);
            default:
                return;
        }
    },
    format: function format(game, formatted) {
        formatted.remainingTime = this.remainingTime;
        return formatted;
    },
    checkForEnd: function checkForEnd(game) {
        var unconfirmed = game.players.filter((player) => !player.confirmedRole);
        if (!unconfirmed.length) game.switchToPhase(Playing);
    }
});
