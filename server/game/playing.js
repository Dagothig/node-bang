var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),

    stats = aReq('server/game/stats'),
    roles = aReq('server/game/roles'),

    Phase = aReq('server/game/phase'),
    CardPile = aReq('server/game/card-pile'),
    Turn = aReq('server/game/turn');

module.exports = new Phase('Playing', {

    goToNextTurn: function(game) {
        this.turn = this.getNextTurn(game);
    },

    getNextTurn: function(game) {
        var player;
        if (!this.turn) {
            player = game.players.find(p => p.role === roles.sheriff);
        } else {
            var index = (game.players.indexOf(this.turn.player) + 1) % game.players.length;
            player = game.players[index];
        }
        return new Turn(game, player);
    },

    begin: function(game) {
        this.cards = new CardPile(aReq('server/game/cards'));
        game.players.forEach(p => this.extendPlayer(p));
        this.goToNextTurn(game);
    },

    extendPlayer: function(player) {
        // Equipped first: it's needed for stat calculations
        player.equipped = misc.merge([], {
            stat: function(stat) {
                return this.reduce((sum, equipment) => {
                    return sum + (equipment[stat]|0);
                }, 0);
            }
        });

        // Distance second: it's needed for the remainder of the player values
        misc.merge(player, {
            modifier: function(name) {
                var modifier = name + 'Modifier';
                return (this.character[modifier]|0)
                    + (this.role[modifier]|0)
                    + (this.equipped.stat(modifier)|0);
            },
            stat: function(name) {
                if (stats[name] === undefined) throw 'State ' + name + ' does not exist';
                return stats[name] + this.modifier(name);
            },

            distanceTo: function(players, to) {
                var dist = Math.abs(players.indexOf(this) - players.indexOf(to));
                return Math.min(dist, players.length - dist) + to.modifier('distance');
            }
        });

        // Life third: it's used in the hand limit calculations
        player.life = player.lifeMax = player.stat('life');
        player.damage = function(amount) {
            this.life -= amount;
            if (this.life <= 0) throw 'Handle dying you dimwit!';
        }

        // Hand
        var cards = this.cards;
        player.hand = misc.merge(cards.draw(player.stat('initCards')), {
            drawFromPile: function(amount) {
                cards.draw(amount).forEach(card => this.push(card));
            },
            discard: function(cardId) {
                var card = this.find(card => card.id === cardId);
                var index = this.indexOf(card);
                if (index < 0 || index >= this.length) return null;
                this.splice(index, 1);
                cards.discarded.push(card);
                return card;
            },

            get cardMax() {
                return player.life;
            },
            get cardCount() {
                return player.hand ? player.hand.length : 0;
            },
            get isTooLarge() {
                return this.cardCount > this.cardMax;
            }
        });
    },

    end: function(game) {
        game.players.forEach(p => {
            delete p.life;
            delete p.lifeMax;
            delete p.damage;

            delete p.hand;

            delete p.rangeModifier;
            delete p.distanceModifier;
            delete p.range;
            delete p.bangRange;
            delete p.distanceTo;
        });
    },

    actionsFor: function(game, player) {
        if (!player || !this.turn) return {};
        return this.turn.actionsFor(player);
    },

    handleAction: function(game, player, msg) {
        if (!player || !this.turn) return;
        this.turn.handleAction(player, msg);
    },

    format: function(game, player, formatted) {
        return misc.merge(formatted, {
            turn: {
                player: this.turn.player.name,
                step: this.turn.step.format()
            }
        });
    },

    formatPlayer: function(game, player, other, formatted) {
        return misc.merge(formatted, {
            hand: {
                // TODO: format cards properly
                cards: player === other ?
                    other.hand.slice().map(card => ({
                        id : card.id,
                        rank: card.rank,
                        suit: card.suit
                    })) :
                    other.hand.length
            },
            life: other.life,
            lifeMax: other.lifeMax
        });
    }
});
