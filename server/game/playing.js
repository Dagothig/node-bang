var misc = aReq('server/misc'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),

    stats = aReq('server/game/stats'),
    roles = aReq('server/game/roles'),
    cardTypes = aReq('server/game/card-types'),

    Phase = aReq('server/game/phase'),
    CardPile = aReq('server/game/card-pile'),
    Turn = aReq('server/game/turn');

module.exports = new Phase('Playing', {

    goToNextTurn: function(game) {
        this.turn = this.getNextTurn(game);
    },

    getNextTurn: function(game) {
        var player, alive = game.players.filter(p => p.alive);
        if (!this.turn) player = alive.find(p => p.role === roles.sheriff);
        else player = alive[(alive.indexOf(this.turn.player) + 1) % alive.length];
        return new Turn(game, player);
    },

    begin: function(game) {
        this.cards = new CardPile(aReq('server/game/cards'));
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
                return (index >= 0 && index < this.length) ? this.splice(index, 1)[0] : null;
            },
            discard: function(cardId) {
                var card = this.remove(cardId);
                if (card) cards.discarded.push(card);
            },
            handlers: function(eventName) {
                return this.filter(e => e[eventName]);
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
                if (stats[name] === undefined) throw 'Stat ' + name + ' does not exist';
                return stats[name] + this.modifier(name);
            },

            distanceTo: function(players, to) {
                var dist = Math.abs(players.indexOf(this) - players.indexOf(to));
                return Math.min(dist, players.length - dist) + to.modifier('distance');
            },

            stats: function() {
                var obj = {};
                Object.keys(stats).forEach(stat => obj[stat] = this.stat(stat));
                return obj;
            },

            onEvent: function(eventName, recurseArgs, following, onResolved) {
                var handlers = [];
                var charHandler = this.character[eventName],
                    roleHandler = this.role[eventName],
                    equippedHandlers = this.equipped.handlers(eventName);
                if (charHandler) handlers.push(this.character);
                if (roleHandler) handlers.push(this.role);
                equippedHandlers.forEach(e => handlers.push(e));

                handlers.reverse();

                // This is sortah defined backwards:
                // We need to build an array of arguments for the individual events we call
                // but to do that, we need to define the onResolved that will be passed and
                // that will recurse.
                // However, to define that we need to define the function that will be called for
                // the recursing. Luckily we can define this one as taking the args as a parameter,
                // so this is where we don't need to pre-define things anymore
                var handlePile = args => {
                    var next = handlers.pop();
                    onResolved(next ? next[eventName].apply(next, args) : following);
                }
                // on sub resolved; if it is given an event, it goes to it,
                // otherwise, it proceeds with the remainder of the pile
                recurseArgs.push(event => event ? onResolved(event) : handlePile(recurseArgs));
                recurseArgs.push(onResolved);
                return handlePile(recurseArgs);
            }
        });

        // Life third: it's used in the hand limit calculations
        misc.merge(player, {
            life: player.stat('life'),
            damage: function(amount, onResolved) {
                this.life -= amount;
                if (this.dead) return cardTypes.Beer.getDeathEvent(player,
                    event => {
                        if (player.dead && player === phase.turn.player) throw 'Need to handle player death during turn';
                        phase.checkForEnd(game);
                        onResolved();
                    }
                );
            },
            heal: function(amount) {
                this.life = Math.min(this.life + amount, this.stat('life'));
            },
            get dead() {
                return this.life <= 0;
            },
            get alive() {
                return this.life > 0;
            }
        });

        // Hand
        var cards = this.cards;
        player.hand = misc.merge(cards.draw(player.stat('initCards')), {
            drawFromPile: function(amount) {
                cards.draw(amount).forEach(card => this.push(card));
            },
            remove: function(cardId) {
                var index = this.indexOf(this.find(card => card.id === cardId));
                return (index >= 0 && index < this.length) ? this.splice(index, 1)[0] : null;
            },
            discard: function(cardId) {
                var card = this.remove(cardId);
                if (card) cards.discarded.push(card);
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
            delete p.equipped;

            delete p.modifier;
            delete p.stat;
            delete p.distanceTo;
            delete p.stats;

            delete p.onEvent;

            delete p.life;
            delete p.damage;
            delete p.heal;
            delete p.dead;
            delete p.alive;

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
        player.life = 0;
        this.checkForEnd(game);
        throw 'Checking for end is insufficient: need to make it drop players from events and such';
    },

    format: function(game, player, formatted) {
        return misc.merge(formatted, {
            turn: {
                player: this.turn.player.name,
                step: this.turn.step.format()
            },
            cards: {
                pile: this.cards.length,
                discard: this.cards.discarded.map(card => ({
                    id : card.id,
                    rank: card.rank,
                    suit: card.suit
                }))
            }
        });
    },

    formatPlayer: function(game, player, other, formatted) {
        return misc.merge(formatted, {
            hand: {
                // TODO: format cards properly
                cards: player === other ?
                    other.hand.map(card => ({
                        id: card.id,
                        rank: card.rank,
                        suit: card.suit,
                        type: card.type
                    })) :
                    other.hand.length
            },
            equipment: other.equipped.map(card => ({
                id: card.id,
                rank: card.rank,
                suit: card.suit,
                type: card.type
            })),
            life: other.life,
            stats: other.stats(),
            distance: player.distanceTo(game.players, other)
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
        // If no outlaws and no renegades have won, then the sheriff and deputies have won
        else if (!(aliveCount.outlaw + aliveCount.renegade)) {
            game.end();
        }
    }
});