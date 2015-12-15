var misc = require('../misc.js'),
    log = require('../log.js'),
    warn = require('../warn.js'),
    consts = require('../../shared/consts.js'),

    roles = require('./roles.js'),
    Phase = require('./phase.js');

function Turn(player) {

}

module.exports = new Phase('Playing', {

    begin: function begin(game) {
        this.cards = require('./cards.js');
        this.discarded = [];
        this.turn = new Turn(game.players.find(p => p.role === roles.sheriff));
    },

    end: function end(game) {

    },

    actionsFor: function actionsFor(game, user) {
        var player = game.findPlayer(user);
        if (!player) return {};
        var acts = {};
        return acts;
    },

    handleAction: function handleAction(game, user, msg) {
        var player = game.findPlayer(user);
        if (!player) return;
        switch (msg.action) {
            default:
                return;
        }
    },

    format: function format(game, formatted) {
        formatted.turn = this.turn.player.name;
    }
});
