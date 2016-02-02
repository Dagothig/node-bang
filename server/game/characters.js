'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    Character = aReq('server/game/character'),
    events = aReq('server/game/events'),
    Card = aReq('server/game/cards/card'),
    suits = Card.suits,
    Barile = aReq('server/game/cards/barile');

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
            if (second.suit === suits.hearts || second.suit === suits.diamonds) {
                step.player.hand.drawFromPile();
            }
            step.game.onGameEvent({
                name: 'Draw',
                player: step.player.name,
                card: second.format()
            });
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
            }
            onResolved();
        }
    }),

    new Character("Jesse Jones", {
        beforeDraw: function(step, onResolved, onSkip) {
            if (step.player.character !== this) return onResolved();

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
                        this.handleSteal(step, onResolved, onSkip);
                }
            });
        },
        handleSteal: function(step, onResolved, onSkip) {
            onResolved(events.targetOthers(
                step.player, step.game.players,
                target => {
                    step.player.hand.push(misc.spliceRand(target.hand));
                    step.player.hand.drawFromPile();
                    onSkip();
                },
                () => onResolved()
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

            onResolved({
                actionsFor: function(p) {
                    if (p !== step.player) return {};
                    let acts = {};
                    acts[actions.draw] = ['pile', 'discarded'];
                    return acts;
                },
                handleAction: function(p, msg) {
                    if (p !== step.player) return;
                    if (msg.action === actions.draw) {
                        if (msg.arg === 'pile') onResolved();
                        else if (msg.arg === 'discarded') {
                            p.hand.drawFromPile();
                            let card = step.phase.cards.discarded.pop();
                            p.hand.push(card);
                            step.game.onGameEvent({
                                name: 'Draw',
                                player: player.name,
                                card: card.format()
                            });
                            onSkip();
                        }
                    }
                }
            });
        }
    }),

    new Character("Rose Doolan", {
        bangRangeModifier: 1,
        rangeModifider: 1
    }),

    /*new Character("Sid Ketchum", {

    }),*/

    /*new Character("Slab the Killer", {

    }),*/

    /*new Character("Suzy Lafayette", {

    }),*/

    new Character("Vulture Sam", {
        dying: function(step, killer, player, amount, onResolved, onSkip) {
            // If vulture sam is actually the one dying, then his power can't trigger
            if (player.character === this) onResolved();

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