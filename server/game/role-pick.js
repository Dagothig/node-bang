'use strict';

var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts'),

    actions = aReq('server/actions'),
    roles = aReq('server/game/roles'),

    Phase = aReq('server/game/phase'),
    Playing = aReq('server/game/playing');

module.exports = new Phase('Role pick', {
    begin: function(game) {
        // We "support" roles for as low as 1 player for debugging purposes
        var r = [roles.sheriff];
        if (game.players.length >= 2) r.push(roles.renegade);
        if (game.players.length >= 3) r.push(roles.outlaw);
        if (game.players.length >= 4) r.push(roles.outlaw);
        if (game.players.length >= 5) r.push(roles.deputy);
        if (game.players.length >= 6) r.push(roles.outlaw);
        if (game.players.length >= 7) r.push(roles.deputy);
        if (game.players.length >= 8) r.push(roles.outlaw);
        var sheriffIndex;
        game.players.forEach((player, i) => {
            player.role = misc.spliceRand(r);
            if (player.role === roles.sheriff) sheriffIndex = i;
            log(player.user.name, 'is', player.role.name);
        });

        // Once the roles have been assigned,
        // let's recut the players array so it starts with the sheriff
        game.players = misc.fromArrays(
            game.players.slice(sheriffIndex, game.players.length),
            game.players.slice(0, sheriffIndex)
        );

        this.remainingTime = consts.rolePickMaxTime;
        this.remainingInterval = setInterval(() => {
            if (--this.remainingTime > 0) game.onGameUpdate();
            else game.switchToPhase(Playing);
        }, 1000);
    },
    update: (game, delta) => {},
    end: function(game) {
        game.players.forEach(p => {
            delete p.confirmedRole;
        });
        if (this.remainingInterval) {
            clearInterval(this.remainingInterval);
            this.remainingInterval = null;
            this.remainingTime = null;
        }
    },
    actionsFor: function(game, player) {
        var acts = {};
        if (!player) return acts;
        if (!player.confirmedRole) acts[actions.cancel] = ['cancel'];
        return acts;
    },
    handleAction: function(game, player, msg) {
        if (!player) return;
        switch (msg.action) {
            case actions.cancel:
                player.confirmedRole = true;
                this.checkForEnd(game);
                break;
            default:
                return;
        }
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
        var unconfirmed = game.players.filter(player => !player.confirmedRole);
        if (!unconfirmed.length) game.switchToPhase(Playing);
    }
});
