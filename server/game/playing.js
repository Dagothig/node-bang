var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts'),

    roles = aReq('server/game/roles'),

    Phase = aReq('server/game/phase'),
    CardPile = aReq('server/game/card-pile');

function Turn(player) {
    this.player = player;
    this.phase = this.getNextPhase();
}
Turn.prototype = Object.create({
    getNextPhase: function() {
        if (!this.phase) return new Turn.phases.Draw(this.player);
        var nextPhase = this.phase.constructor.nextPhase;
        if (nextPhase) return new nextPhase(this.player);
        return null;
    }
});
function Draw(player) {

}
function Play(player) {

}
function Discard(player) {

}
Draw.nextPhase = Play;
Play.nextPhase = Discard;
Turn.phases = {
    Draw: Draw,
    Play: Play,
    Discard: Discard
};

module.exports = new Phase('Playing', {

    getNextTurn: function(game) {
        var player;
        if (!this.turn) {
            player = game.players.find(p => p.role === roles.sheriff);
        } else {
            var index = (game.players.indexOf[this.turn.player] + 1) % game.players.length;
            player = game.players[index];
        }
        return new Turn(player);
    },

    begin: function(game) {
        this.cards = new CardPile(aReq('server/game/cards'));
        this.turn = this.getNextTurn(game);

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
                modifier: function(name) {
                    var modifier = name + 'Modifier';
                    return this.character[modifier]|0
                        + this.role[modifier]|0
                        + this.equipped.stat(modifier)|0;
                },
                stat: function(name, baseVal) {
                    return baseVal + this.modifier(name);
                },

                distanceTo: function(to) {
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

    actionsFor: function(game, user) {
        var player = game.findPlayer(user);
        if (!player) return {};
        var acts = {};
        return acts;
    },

    handleAction: function(game, user, msg) {
        var player = game.findPlayer(user);
        if (!player) return;
        switch (msg.action) {
            default:
                return;
        }
    },

    format: function(game, user, formatted) {
        return formatted;
    },

    formatPlayer: function(game, user, player, formatted) {
        return misc.merge(formatted, {
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
