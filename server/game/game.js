var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),

    CharacterPick = aReq('server/game/character-pick');

function Game(users, onGameUpdate) {
    this.onGameUpdate = onGameUpdate;
    this.players = misc.shuffle(users.map(user => ({ user: user })));
}
Game.prototype = Object.create({
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
                if (player.hand) formatted.hand = {
                    cardMax : player.hand.cardMax,
                    cardCount : player.hand.cardCount,
                    cards: player.hand.slice()
                };
                if (player.lifeMax) {
                    formatted.life = player.life;
                    formatted.lifeMax = player.lifeMax;
                }
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

module.exports = Game;
