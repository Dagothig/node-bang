var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts'),

    roles = aReq('server/game/roles'),

    Phase = aReq('server/game/phase'),
    CardPile = aReq('server/game/card-pile');

function Turn(player) {
    this.player = player;
}
Turn.prototype = Object.create({

});
function TurnPhase(steps) {
    this.steps = steps;
}
var turnPhases = {
    draw: new TurnPhase(),
    play: new TurnPhase(),
    discard: new TurnPhase()
};

module.exports = new Phase('Playing', {

    begin: function begin(game) {
        this.cards = new CardPile(aReq('server/game/cards'));
        this.turn = new Turn(game.players.find(p => p.role === roles.sheriff));

        game.players.forEach(p => {
            // Life
            p.life = p.lifeMax = p.character.lifeMax + p.role.lifeBonus;

            // Hand
            var handSize = Math.min(p.lifeMax, consts.initCardMax);
            p.hand = misc.merge(this.cards.take(handSize), {
                get cardMax() {
                    return p.life;
                },
                get cardCount() {
                    return p.hand ? p.hand.length : 0;
                }
            });

            // Equipped
            p.equipped = misc.merge([], {
                stat: function(stat) {
                    return this.reduce((sum, equipment) => {
                        return sum + equipment[stat]|0;
                    }, 0);
                }
            });

            // Distance
            misc.merge(p, {
                modifier: function modifier(name) {
                    var modifier = name + 'Modifier';
                    return this.character[modifier]|0
                        + this.role[modifier]|0
                        + this.equipped.stat(modifier)|0;
                },
                stat: function stat(name, baseVal) {
                    return baseVal + this.modifier(name);
                },

                distanceTo: function distanceTo(to) {
                    var players = game.players;
                    var dist = Math.abs(players.indexOf(this) - players.indexOf(to));
                    return Math.min(dist, players.length - dist) + to.modifier('distance');
                }
            });
        });
    },

    end: function end(game) {
        game.players.forEach(p => {
            delete p.life;
            delete p.lifeMax;

            delete p.hand;

            delete p.rangeModifier;
            delete p.distanceModifier;
            delete p.range;
            delete p.bangRange;
            delete p.distanceTo;
        });
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

    format: function format(game, user, formatted) {
        return formatted;
    },

    formatPlayer: function formatPlayer(game, user, player, formatted) {
        return Object.assign(formatted, {
            hand: {
                cardMax : player.hand.cardMax,
                cardCount : player.hand.cardCount,
                // TODO: format cards properly
                cards: player.user === user ?
                    player.hand.slice() :
                    undefined
            },
            life: player.life,
            lifeMax: player.lifeMax
        });
    }
});
