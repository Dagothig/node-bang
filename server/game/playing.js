'use strict';

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
        var player, alive = game.players.filter(p => p.alive);
        if (!alive.length) return null;
        if (!this.turn) player = alive.find(p => p.role === roles.sheriff);
        else player = alive[(alive.indexOf(this.turn.player) + 1) % alive.length];
        return new Turn(game, player);
    },

    begin: function(game) {
        this.cards = new CardPile(aReq('server/game/cards').slice());
        game.players.forEach(p => this.extendPlayer(game, p));
        this.goToNextTurn(game);
    },

    extendPlayer: function(game, player) {
        var phase = this;

        // Equipped first: it's needed for stat calculations
        player.equipped = misc.merge([], {
            stat: function(stat) {
                return this.reduce((sum, equipment) => {
                    return sum + (equipment[stat]|0);
                }, 0);
            },
            remove: function(cardId) {
                var index = this.indexOf(this.find(card => card.id === cardId));
                return (index >= 0 && index < this.length) ?
                    this.splice(index, 1)[0] : null;
            },
            discard: function(cardId) {
                var card = this.remove(cardId);
                if (card) {
                    cards.discarded.push(card);
                    game.onGameEvent({
                        name: 'discard',
                        from: 'equipped',
                        player: player.name,
                        card: card.format()
                    });
                }
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
                if (stats[name] === undefined)
                    throw 'Stat ' + name + ' does not exist';
                return stats[name] + this.modifier(name);
            },

            distanceTo: function(players, to) {
                var dist = Math.abs(players.indexOf(this) - players.indexOf(to));
                dist = Math.min(dist, players.length - dist);
                return dist + to.modifier('distance');
            },

            stats: function() {
                var obj = {};
                Object.keys(stats).forEach(stat => obj[stat] = this.stat(stat));
                return obj;
            },

            handlers: function(eventName) {
                var handlers = [];
                if (this.character[eventName]) handlers.push(this.character);
                if (this.role[eventName]) handlers.push(this.role);
                this.equipped.forEach(e => e[eventName] && handlers.push(e));
                handlers.sort((handlers, i) => handlers.priority|0);

                return handlers;
            }
        });

        // Life third: it's used in the hand limit calculations
        misc.merge(player, {
            life: player.stat('life'),
            heal: function(amount) {
                this.life = Math.min(this.life + amount, this.stat('life'));
            },
            get dead() {
                return this.life <= 0;
            },
            get alive() {
                return this.life > 0;
            },
            get zombie() {
                return this.alive && this.user.isDisconnected;
            }
        });

        // Hand
        var cards = this.cards;
        player.hand = misc.merge(cards.draw(player.stat('initCards')), {
            drawFromPile: function(amount) {
                cards.draw(amount||1).forEach(card => this.push(card));
                game.onGameEvent({
                    name: 'draw',
                    from: 'pile',
                    player: player.name,
                    amount: amount||1
                });
            },
            remove: function(cardId) {
                var index = this.indexOf(this.find(card => card.id === cardId));
                return (index >= 0 && index < this.length) ?
                    this.splice(index, 1)[0] : null;
            },
            removeRand: function() {
                return misc.spliceRand(this);
            },
            discard: function(cardId) {
                if (!arguments.length) {
                    let discarded = this.slice();
                    this.length = 0;
                    cards.discarded.push.apply(cards.discarded, discarded);
                    game.onGameEvent({
                        name: 'discard',
                        from: 'hand',
                        player: player.name,
                        cards: discarded.map(c => c.format())
                    });
                    return;
                }

                var card = this.remove(cardId);
                if (card) {
                    cards.discarded.push(card);
                    game.onGameEvent({
                        name: 'discard',
                        from: 'hand',
                        player: player.name,
                        card: card.format()
                    });
                }
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

    update: function(game, delta) {
        return this.turn && this.turn.update(delta);
    },

    end: function(game) {
        game.players.forEach(p => {
            delete p.equipped;

            delete p.modifier;
            delete p.stat;
            delete p.distanceTo;
            delete p.stats;

            delete p.life;
            delete p.heal;
            delete p.dead;
            delete p.alive;
            delete p.zombie;

            delete p.hand;
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

    handleDisconnect: function(game, player) {
        log(player.name, 'is now a zombie!');
        this.turn.handleDisconnect(player);
    },

    format: function(game, player, formatted) {
        return misc.merge(formatted, {
            turn: {
                player: this.turn.player.name,
                step: this.turn.step.format()
            },
            cards: {
                pile: this.cards.length,
                discard: this.cards.discarded.map(card => card.format())
            }
        });
    },

    formatPlayer: function(game, player, other, formatted) {
        return misc.merge(formatted, {
            hand: {
                cards: player === other ?
                    other.hand.map(card => card.format()) :
                    other.hand.length
            },
            equipped: other.equipped.map(card => card.format()),
            life: other.life,
            stats: other.stats(),
            distance: player ? player.distanceTo(game.players, other) : undefined
        });
    },

    checkForEnd: function(game) {
        var alive = game.players.filter(p => p.alive);
        var aliveCount = {};
        Object.keys(roles).forEach(key => aliveCount[key] = 0);
        alive.forEach(p => aliveCount[p.role.key]++);
        // If the sheriff is dead, then either a renegade or the outlaws have won
        if (!aliveCount.sheriff) {
            // If there is one alive and it's a renegade; they have won
            if (alive.length === 1 && alive[0].role === roles.renegade) {
                game.end();
            }
            // Otherwise, outlaws have won
            else {
                game.end();
            }
        }
        // If no outlaws and no renegades have won,
        // then the sheriff and deputies have won
        else if (!(aliveCount.outlaw + aliveCount.renegade)) {
            game.end();
        }
    }
});