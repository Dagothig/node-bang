var misc = require('../misc.js'),
    log = require('../log.js'),
    characters = require('./characters.js'),
    roles = require('./roles.js'),
    actions = require('../../shared/actions.js'),
    consts = require('../../shared/consts.js');

function Game(users, onGameUpdate) {
    this.onGameUpdate = onGameUpdate;
    this.players = misc.shuffle(users.map((user) => new Player(user)));
}
Game.prototype = Object.create({
    begin: function() {
        this.switchToPhase(CharacterPick);
    },
    switchToPhase: function switchToPhase(phase) {
        if (this.phase) this.phase.end(this);

        this.phase = phase;
        this.phase.begin(this);
        this.onGameUpdate();
    },
    findPlayer: function findPlayer(user) {
        return this.players.find((player) => player.user.token === user.token);
    },
    formatted: function formatted(user) {
        return ({
            players: this.players.map((player) => {
                var formatted = { name: player.user.name };
                if (player.character) formatted.character = { name: player.character.name };
                if (player.role) formatted.role = { name: player.role.publicName };
                return formatted;
            }),
            actions: this.phase.actionsFor(this, user)
        });
    },
    handleAction: function handleAction(user, msg) {
        if (!this.findPlayer(user) || !msg.action) return;
        this.phase.handleAction(this, user, msg);
        this.onGameUpdate();
    }
});

var CharacterPick = {
    begin: function begin(game) {
        log('Character pick starting...');
        var chars = characters.slice();
        game.players.forEach((player) =>
            player.characters = misc.gen(() => misc.spliceRand(chars), consts.characterChoices)
        );
    },
    end: function end(game) {
        log('Character pick ended!');
        game.players.forEach((player) => {
            delete player.characters;
            log(player.user.name, 'is', player.character.name);
        });
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
    checkForEnd: function checkForEnd(game) {
        var unchosen = game.players.filter((player) => !player.character);
        if (!unchosen.length) game.switchToPhase(RolePick);
    }
};
var RolePick = {
    begin: function begin(game) {
        var r = [roles.sheriff, roles.outlaw, roles.outlaw, roles.renegade];
        if (game.players.length >= 5) r.push(roles.deputy);
        if (game.players.length >= 6) r.push(roles.outlaw);
        if (game.players.length >= 7) r.push(roles.deputy);
        game.players.forEach((player) => {
            player.role = misc.spliceRand(r);
            log(player.user.name, 'is', player.role.name);
        });
    },
    end: function end(game) {},
    actionsFor: function actionsFor(game, user) {},
    handleAction: function handleAction(game, user, msg) {}
}


function Player(user) {
    this.user = user;
}

module.exports = Game;
