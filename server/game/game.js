var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),

    Player = aReq('server/game/player'),
    CharacterPick = aReq('server/game/character-pick');

function Game(users, onGameUpdate) {
    this.onGameUpdate = onGameUpdate;
    this.players = misc.shuffle(users.map(user => new Player(user)));
}
misc.merge(Game.prototype, {
    begin: function begin() {
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
    nextPlayer: function nextPlayer(player) {
        return this.players[(this.players.indexOf(player) + 1) % this.players.length];
    },
    formatted: function formatted(user) {
        var game = this;
        return this.phase.format(game, user, {
            players: this.players.map((player) =>
                this.phase.formatPlayer(game, user, player, {
                    name: player.user.name,
                    character: player.character ? {
                        name: player.character.name
                    } : undefined,
                    role: player.role ? {
                        name: player.user === user ?
                            player.role.name :
                            player.role.publicName
                    } : undefined,
                })
            ),
            actions: this.phase.actionsFor(this, user)
        });
    },
    handleAction: function handleAction(user, msg) {
        if (!this.findPlayer(user) || !msg.action) return;
        this.phase.handleAction(this, user, msg);
        this.onGameUpdate();
    }
});

module.exports = Game;
