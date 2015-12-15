var misc = require('../misc.js'),
    log = require('../log.js'),
    warn = require('../warn.js'),

    CharacterPick = require('./character-pick.js');

function Game(users, onGameUpdate) {
    this.onGameUpdate = onGameUpdate;
    this.players = misc.shuffle(users.map((user) => new Player(user)));
}
Game.prototype = Object.create({
    begin: function() {
        this.switchToPhase(CharacterPick);
    },
    switchToPhase: function switchToPhase(phase) {
        if (this.phase) {
            this.phase.end(this);
            log(this.phase.name, 'ending');
        }

        this.phase = phase;
        log(this.phase.name, 'starting');
        this.phase.begin(this);
        this.onGameUpdate();
    },
    findPlayer: function findPlayer(user) {
        return this.players.find((player) => player.user.token === user.token);
    },
    formatted: function formatted(user) {
        var obj = ({
            players: this.players.map((player) => {
                var formatted = { name: player.user.name };
                if (player.character) formatted.character = {
                    name: player.character.name
                };
                if (player.role) formatted.role = {
                    name: player.user === user ? player.role.name : player.role.publicName
                };
                log(formatted);
                return formatted;
            }),
            actions: this.phase.actionsFor(this, user)
        });
        if (this.phase) return this.phase.format(this, obj);
        else return obj;
    },
    handleAction: function handleAction(user, msg) {
        if (!this.findPlayer(user) || !msg.action) return;
        this.phase.handleAction(this, user, msg);
        this.onGameUpdate();
    }
});

function Player(user) {
    this.user = user;
}

module.exports = Game;
