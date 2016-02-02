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
            target.hand.drawFromPile();
            onResolved();
        }
    }),

    new Character("Black Jack", {
        afterDraw: function(step, cards, onResolved, onSkip) {
            var second = cards[1];
            if (second.suit === suits.hearts || second.suit === suits.diamonds) {
                step.player.hand.drawFromPile();
            }
            step.game.onGameEvent({
                name: 'Draw',
                player: 'Black Jack',
                card: second.format()
            });
            onResolved();
        }
    }),

    new Character("Calamity Janet", {

    }),

    new Character("El Gringo", {
        afterDamage: function(step, source, target, amount, onResolved, onSkip) {
            if (source) {
                var card = misc.spliceRand(source.hand);
                if (card) target.hand.push(card);
            }
            onResolved();
        }
    }),

    new Character("Jesse Jones", {
        beforeDraw: function(step, onResolved, onSkip) {
            onResolved({
                actionsFor: function(p) {
                    if (p !== step.player) return {};
                    var acts = {}
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
            return this.permaBarile
                .beforeBangResponse(step, card, target, onResolved, onSkip);
        }
    }),

    new Character("Kit Carlson", {

    }),

    new Character("Lucky Duke", {

    }),

    new Character("Paul Regret", {
        lifeModifier: -1,
        initCardsModifier: -1,
        distanceModifier: 1
    }),

    new Character("Pedro Ramirez", {
        beforeDraw: function(step, onResolved, onSkip) {
            if (!step.phase.cards.discarded.length) {
                onResolved();
                return;
            }

            onResolved({
                actionsFor: function(p) {
                    if (p !== step.player) return {};
                    var acts = {};
                    acts[actions.draw] = ['pile', 'discarded'];
                    return acts;
                },
                handleAction: function(p, msg) {
                    if (p !== step.player) return;
                    if (msg.action === actions.draw) {
                        if (msg.arg === 'pile') onResolved();
                        else if (msg.arg === 'discarded') {
                            p.hand.drawFromPile();
                            p.hand.push(step.phase.cards.discarded.pop());
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

    new Character("Sid Ketchum", {

    }),

    new Character("Slab the Killer", {

    }),

    new Character("Suzy Lafayette", {

    }),

    new Character("Vulture Sam", {

    }),

    new Character("Willy the Kid", {
        bangsModifier: 1000
    })
];

module.exports = characters;