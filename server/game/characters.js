'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    Character = aReq('server/game/character'),

    Card = aReq('server/game/cards/card'),
    suits = Card.suits,

    events = aReq('server/game/events'),
    handles = aReq('server/game/cards/handles'),

    Barile = aReq('server/game/cards/barile'),
    attacking = aReq('server/game/cards/attacking'),
    Bang = attacking.Bang,
    Mancato = attacking.Mancato;

var characters = [
    new Character("Bart Cassidy", {
        afterDamage: function(step, source, target, amount, onResolved, onSkip) {
            if (target.character !== this) return onResolved();
            target.hand.drawFromPile(amount);
            onResolved();
        }
    }),

    new Character("Black Jack", {
        afterDraw: function(step, cards, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();

            let second = cards[1];
            step.game.onGameEvent({
                name: 'Drew',
                player: step.player.name,
                card: second.format()
            });
            if (second.suit === suits.hearts || second.suit === suits.diamonds) {
                step.player.hand.drawFromPile();
            }
            onResolved();
        }
    }),

    /*new Character("Calamity Janet", {

    }),*/

    new Character("El Gringo", {
        lifeModifier: -1,
        initCardsModifier: -1,
        afterDamage: function(step, source, target, amount, onResolved, onSkip) {
            if (target.character !== this) return onResolved();

            if (source) {
                let card = misc.spliceRand(source.hand);
                if (card) target.hand.push(card);
                step.game.onGameEvent({
                    name: 'Steal',
                    thief: target.name,
                    player: source.name
                });
            }

            onResolved();
        }
    }),

    new Character("Jesse Jones", {
        beforeDraw: function(step, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();

            let self = this;
            onResolved({
                actionsFor: function(p) {
                    if (p !== step.player) return {};
                    let acts = {}
                    acts[actions.draw] = ['pile', 'player'];
                    return acts;
                },
                handleAction: function(p, msg) {
                    if (p !== step.player) return;
                    if (msg.action !== actions.draw) return;
                    if (msg.arg === 'pile') onResolved();
                    else if (msg.arg === 'player')
                        self.handleSteal(step, onResolved, onSkip);
                }
            });
        },
        handleSteal: function(step, onResolved, onSkip) {
            onResolved(events.targetEvent(
                step.player, step.game.players
                    .filter(p => p !== step.player && p.alive && p.hand.length),
                target => {
                    step.player.hand.push(misc.spliceRand(target.hand));
                    step.player.hand.drawFromPile();
                    step.game.onGameEvent({
                        name: 'Steal',
                        thief: step.player.name,
                        player: target.name
                    });
                    onSkip();
                },
                () => this.beforeDraw(step, onResolved, onSkip)
            ));
        }
    }),

    new Character("Jourdonnais", {
        permaBarile: new Barile(undefined, undefined, suits.hearts),
        beforeBangResponse: function(step, card, target, onResolved, onSkip) {
            if (target.character !== this) return onResolved();

            return this.permaBarile
                .beforeBangResponse(step, card, target, onResolved, onSkip);
        }
    }),

    new Character("Kit Carlson", {
        beforeDraw: function(step, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();

            onResolved(events.cardsDrawEvent(
                step.player, step.phase.cards, 3,
                cards => onResolved(events.cardChoiceEvent(
                    step.player, cards,
                    card => {
                        misc.remove(cards, card);
                        step.phase.cards.push(card);
                        onSkip();
                    },
                    undefined
                ))
            ));
        }
    }),

    /*new Character("Lucky Duke", {

    }),*/

    new Character("Paul Regret", {
        lifeModifier: -1,
        initCardsModifier: -1,
        distanceModifier: 1
    }),

    new Character("Pedro Ramirez", {
        beforeDraw: function(step, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();
            if (!step.phase.cards.discarded.length) return onResolved();

            let self = this;
            onResolved({
                actionsFor: function(p) {
                    if (p !== step.player) return {};
                    let acts = {};
                    acts[actions.draw] = ['pile', 'discarded'];
                    return acts;
                },
                handleAction: function(p, msg) {
                    if (p !== step.player) return;
                    if (msg.action !== actions.draw) return;
                    if (msg.arg === 'pile') onResolved();
                    else if (msg.arg === 'discarded')
                        self.handleDrawDiscard(step, onResolved, onSkip);
                }
            });
        },
        handleDrawDiscard: function(step, onResolved, onSkip) {
            step.player.hand.drawFromPile();
            let card = step.phase.cards.discarded.pop();
            step.player.hand.push(card);
            step.game.onGameEvent({
                name: 'Draw',
                player: step.player.name,
                card: card.format()
            });
            onSkip();
        }
    }),

    new Character("Rose Doolan", {
        bangRangeModifier: 1,
        rangeModifider: 1
    }),

    new Character("Sid Ketchum", {
        healCard: { id: 'heal' },
        beforePlay: function(step, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();
            onResolved(events.cardChoiceEvent(step.player,
                misc.fromArrays(step.player.hand.filter, [this.healCard]),
                // onPlay
                card => card === 'heal' ?
                    this.handleHeal(step, onResolved, onSkip) :
                    card.handlePlay(step, onSkip),
                // onCancel
                () => onSkip()
            ));
        },
        handleHeal: function(step, onResolved, onSkip) {
            let onFinished() = onResolved(this.beforePlay(step, onResolved, onSkip))
            onResolved(events.cardChoiceEvent(step.player,
                step.player.hand,
                card1 => onResolved(events.cardChoiceEvent(step.player,
                    step.player.hand.filter(c => c !== card1),
                    card2 => {
                        step.player.hand.discard(card1.id);
                        step.player.hand.discard(card2.id);
                        step.player.heal(1);
                        onFinished();
                    },
                    onFinished
                )),
                onFinished
            ));
        }
    }),

    new Character("Slab the Killer", {
        beforeBangResponse: function(step, card, target, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();
            if (!(card instanceof Bang)) return onResolved();

            let onCancel = () =>
                handles.damage(step, step.player, target, 1, onSkip);

            let format = () => ({
                name: 'Bang',
                source: step.player.name,
                target: target.name,
                card: card.format()
            });

            onResolved(events.cardTypeEvent(
                target, Mancato,
                // onCard; we ask for another Mancato that isn't the first one
                card1 => onResolved(events.cardChoiceEvent(
                    target,
                    target.hand.filter(c => c instanceof Mancato && c !== card1),
                    card2 => {
                        target.hand.discard(card1.id);
                        target.hand.discard(card2.id);
                        step.game.onGameEvent({
                            name: 'Avoid',
                            what: name,
                            source: step.player.name,
                            target: target.name,
                            cards: [card1.format(), card2.format()]
                        });
                        onSkip();
                    },
                    onCancel, format
                )),
                onCancel, format
            ));
        }
    }),

    new Character("Suzy Lafayette", {
        afterPlay: function(step, onResolved, onSkip) {
            let suzy = step.game.players.find(p => p.character === this);

            if (!suzy.hand.length) suzy.hand.drawFromPile();
            onResolved();
        }
    }),

    new Character("Vulture Sam", {
        beforeDeath: function(step, killer, player, amount, onResolved, onSkip) {
            // If vulture sam is actually the one dying, then his power can't trigger
            if (player.character === this) return onResolved();

            let sam = step.game.players.find(p => p.character === this);

            sam.hand.push.apply(sam.hand, player.hand);
            player.hand.length = 0;

            sam.hand.push.apply(sam.hand, player.equipped);
            player.equipped.length = 0;

            if (player === step.player) step.phase.goToNextTurn(step.game);
            else onSkip();
            step.phase.checkForEnd(step.game);
        }
    }),

    new Character("Willy the Kid", {
        bangsModifier: 1000
    })
];

module.exports = characters;