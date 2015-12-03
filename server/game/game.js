var misc = require('../misc.js'),
    log = require('../log.js'),
    characters = require('./characters.js'),
    roles = require('./roles.js'),
    actions = require('../../shared/actions.js'),
    consts = require('../../shared/consts.js');

function Game(users) {
    this.players = misc.shuffle(users.map((user) => new Player(user)));
    this.phase = CharacterPick;
    this.phase.begin(this);
}
Game.prototype = Object.create({
    findPlayer: function findPlayer(user) {
        return this.players.find((player) => player.user.token === user.token);
    },
    assignRoles: function assignRoles() {
        var roles = [role.sheriff, role.outlaw, role.outlaw, role.renegade];
        if (this.players.length >= 5) roles.push(role.deputy);
        if (this.players.length >= 6) roles.push(role.outlaw);
        if (this.players.length >= 7) roles.push(role.deputy);
        this.players.forEach((player) => player.role = misc.spliceRand(roles));
    },
    formatted: function formatted(user) {
        return ({
            players: this.players.map((player) => ({
                name: player.user.name
            })),
            actions: this.phase.actionsFor(this, user)
        });
    },
    handleAction: function handleAction(user, msg) {
        if (!this.findPlayer(user) || !msg.action) return;
        this.phase.handleAction(this, user, msg);
    }
});

var CharacterPick = {
    begin: function begin(game) {
        var chars = characters.slice();
        game.players.forEach((player) =>
            player.characters = misc.gen(() => misc.spliceRand(chars), consts.characterChoices)
        );
    },
    actionsFor: function actionsFor(game, user) {
        var player = game.findPlayer(user);
        if (!player) return {};
        var acts = {};
        acts[actions.select] = player.characters.map((character) => character.name);
        return acts;
    },
    handleAction: function handleAction(game, user, msg) {
        log(msg.action, msg.arg);
        var player = game.findPlayer(user);
        switch (msg.action) {
            case actions.select:
                player.character = player.characters.find((character) => character.name === msg.arg);
                delete player.characters;
                break;
            default:
                return;
        }
    }
};


function Player(user) {
    this.user = user;
}

module.exports = Game;
