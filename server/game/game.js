'use strict';

var crypto = require('crypto'),
    misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),

    Player = aReq('server/game/player'),
    CharacterPick = aReq('server/game/character-pick');

function Game(users, onUpdate, onEvent, onEnd) {
    this.identifier = crypto.randomBytes(48).toString('hex');
    this.onGameUpdate = onUpdate;
    this.onGameEvent = onEvent;
    this.onGameEnd = onEnd;
    this.players = misc.shuffle(users.map(user => new Player(user)));
}
misc.merge(Game.prototype, {
    begin: function() {
        this.switchToPhase(CharacterPick);
        this.shouldUpdate = true;
        this.update();
    },
    end: function() {
        this.shouldUpdate = false;
        this.onGameEnd();
    },
    update: function(delta) {
        var currentTick = process.hrtime();
        delta: {
            if (!this.lastTick) break delta;

            var secDelta = currentTick[0] - this.lastTick[0];
            var nanoDelta = currentTick[1] - this.lastTick[1];
            var delta = secDelta + nanoDelta / (1000 * 1000 * 1000);

            if (this.phase && this.phase.update(this, delta)) this.onGameUpdate();
        }
        this.lastTick = currentTick;

        setImmediate(() => this.update());
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
        return this.phase.format(game, player, {
            identifier: this.identifier,
            phase: this.phase.name,
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
        this.onGameUpdate();
    }
});

module.exports = Game;