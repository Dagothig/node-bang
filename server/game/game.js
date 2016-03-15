'use strict';

var crypto = require('crypto'),
    misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),

    Player = aReq('server/game/player'),
    CharacterPick = aReq('server/game/character-pick');

function Game(users, onGameUpdate, onGameEvent, onGameEnd) {
    this.identifier = crypto.randomBytes(48).toString('hex');
    this.onGameUpdate = onGameUpdate;
    this.onGameEvent = onGameEvent;
    this.onGameEnd = onGameEnd;
    this.players = misc.shuffle(users.map(user => new Player(user)));
}
misc.merge(Game.prototype, {
    begin: function() {
        this.switchToPhase(CharacterPick);
    },
    end: function() {
        this.onGameEnd();
    },
    switchToPhase: function(phase) {
        if (this.phase) {
            this.phase.end(this);
            log(this.phase.name, 'ending');
        }

        this.phase = phase;
        log(this.phase.name, 'starting');
        this.phase.begin(this);
        this.onGameUpdate();
    },
    findPlayer: function(user) {
        return this.players.find(player => player.user.token === user.token);
    },
    formatted: function(user) {
        var game = this, player = this.findPlayer(user);
        return this.phase.format(game, user, {
            identifier: this.identifier,
            players: this.players.map(other =>
                this.phase.formatPlayer(game, player, other, {
                    name: other.user.name,
                    character: other.character ? {
                        name: other.character.name
                    } : undefined,
                    role: other.role ? {
                        name: player === other || other.dead ?
                            other.role.name :
                            other.role.publicName
                    } : undefined,
                })
            ),
            actions: this.phase.actionsFor(this, player)
        });
    },
    handleAction: function(user, msg) {
        var player = this.findPlayer(user);
        if (!player || !msg.action) return;
        this.phase.handleAction(this, player, msg);
        this.onGameUpdate();
    },
    handleDisconnect: function(user) {
        var player = this.findPlayer(user);
        if (!player) return;
        this.phase.handleDisconnect(this, player);
    }
});

module.exports = Game;
