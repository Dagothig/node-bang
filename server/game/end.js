'use strict';

var consts = aReq('server/consts'),
    actions = aReq('server/actions'),
    Phase = aReq('server/game/phase');

module.exports = new Phase('End', {

    begin: function(game) {
        this.remainingTime = consts.endMaxTime;
        game.players.forEach(p => {
            p.confirmedEnd = !!p.disconnected;
        });
    },

    update: function(game, delta) {
        this.remainingTime -= delta;
        if (this.remainingTime <= 0) game.end();
    },

    // In practice end won't actually be called because game.end() just gets rid of the game object and its' players altogether
    end: function(game) {
        game.players.forEach(p => {
            delete p.confirmedEnd;

            // Previously defined by other phases
            delete p.character;
            delete p.role;
            delete p.winner;
        });
    },

    actionsFor: function(game, player) {
        if (!player || player.confirmedEnd) return {};
        var acts = {};
        acts[actions.cancel] = ['end game'];
        return acts;
    },
    handleAction: function(game, player, msg) {
        if (!player) return false;
        switch(msg.action) {
            case actions.cancel:
                return this.confirmEnd(game, player);
                break;
            default:
                return false;
        }
    },
    handleDisconnect: function(game, player) {
        this.confirmEnd(game, player);
    },
    confirmEnd(game, player) {
        if (player.confirmedEnd) return false;
        player.confirmedEnd = true;
        if (!game.players.find(p => !p.confirmedEnd)) game.end();
        return true;
    },

    format: function(game, player, formatted) {
        formatted.remainingTime = this.remainingTime;
        return formatted;
    },
    formatPlayer: function(game, player, other, formatted) {
        formatted.winner = other.winner;
        formatted.role = {
            name: other.role.name
        };
        return formatted;
    }
});