var misc = require('./misc.js'),
    characters = require('./characters.js'),
    roles = require('./roles.js');

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
        this.players.forEach((player) => {
            player.role = roles.splice((Math.random() * roles.length)|0, i);
        });
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
        game.players.forEach((player) => player.characterChoices)
    },
    actionsFor: function actionsFor(game, user) {
        return game.findPlayer(user) ? ['eat-cake', 'eat-mamma'] : [];
    },
    handleAction: function handleAction(game, user, msg) {
        console.log(msg.action);
    }
};


function Player(user) {
    this.user = user;
}

module.exports = Game;
