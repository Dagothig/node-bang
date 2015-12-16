var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts'),

    roles = aReq('server/game/roles'),
    Phase = aReq('server/game/phase');

function Turn(player) {
    this.player = player;
}

module.exports = new Phase('Playing', {

    begin: function begin(game) {
        this.cards = misc.shuffle(aReq('server/game/cards'));
        this.discarded = [];
        this.turn = new Turn(game.players.find(p => p.role === roles.sheriff));

        game.players.forEach(p => {
            p.life = p.lifeMax = p.character.lifeMax + p.role.lifeBonus;
            log(p.life, p.lifeMax, p.character, p.role);
            var handObj = {
                get initCardMax() {
                    return Math.min(p.lifeMax, consts.initCardMax);
                },
                get cardMax() {
                    return p.life;
                },
                get cardCount() {
                    return p.hand ? p.hand.length : 0;
                }
            };
            Object.assign(
                p.hand = misc.gen(() => this.cards.pop(), handObj.initCardMax),
                handObj
            );
        });
    },

    end: function end(game) {
        game.players.forEach(p => p.hand = null);
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
        return formatted;
    }
});
