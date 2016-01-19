var log = aReq('server/log'),
    Card = aReq('server/game/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function getBangTargetEvent(step, cardId) {
    return new events.TargetEvent(
        step.game, step.player, false, step.player.stat('bangRange'),
        // onTarget
        target => {
            step.bangs++;
            step.player.hand.discard(cardId);
            step.event = getBangResponseEvent(step, target);
        },
        // onCancel
        () => step.event = null
    );
}
function getBangResponseEvent(step, target) {
    return new events.CardChoiceEvent(
        step.game, target, target.hand.filter(c => c instanceof Mancato),
        // onChoice
        card => {
            target.hand.discard(card.id);
            step.event = null;
        },
        // onCancel
        () => step.event = target.damage(1, () => {
            step.event = null;
        }),
        // format
        () => ({
            name: 'Bang',
            target: target.name
        })
    );
}
function Bang(suit, rank) {
    var id = 'bang:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => step.bangs < step.player.stat('bangs'),
        step => step.event = getBangTargetEvent(step, this.id)
    );
}

function Mancato(suit, rank) {
    var id = 'mancato:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown);
}

function Beer(suit, rank) {
    var id = 'beer:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => {
            step.player.hand.discard(this.id);
            step.player.heal(1);
        }
    );
}
Beer.getDeathEvent = function(game, player, onResult) {
    return new events.CardChoiceEvent(
        game, player, player.hand.filter(c => c instanceof Beer),
        // onChoice
        card => {
            player.hand.discard(card.id);
            player.heal(1);
            if (player.alive) onResult();
            else game.onGameUpdate();
        },
        // onCancel
        () => onResult(),
        // format
        () => ({
            name: 'Dying',
            player: player.name
        })
    );
};

function Saloon(suit, rank) {
    var id = 'saloon:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => {
            step.player.hand.discard(this.id);
            step.game.players
                .filter(p => p.alive)
                .forEach(p => p.heal(1));
        }
    );
}

function handleDrawCard(step, card, amount) {
    step.player.hand.discard(card.id);
    step.player.hand.drawFromPile(amount);
}
function Stagecoach(suit, rank) {
    var id = 'stagecoach:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => handleDrawCard(step, this, 2)
    );
}
function WellsFargo(suit, rank) {
    var id = 'wellsfargo:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => handleDrawCard(step, this, 3)
    );
}

function handleEmporio(step, players, player, cards) {
    step.event = events.CardChoiceEvent(
        step.game, player, cards,
        // onChoice
        card => {
            player.hand.push(cards.splice(cards.indexOf(card), 1)[0]);
            if (cards.length) {
                var currentIndex = players.indexOf(player);
                var nextIndex = (currentIndex + 1) % players.length;
                var nextPlayer = players[nextIndex];
                handleEmporio(step, players, nextPlayer, cards);
            } else {
                step.event = null;
            }
        },
        // onCancel
        undefined,
        // format
        () => ({
            name: 'Emporio',
            cards: cards.map(c => c.id),
            player: player.name
        })
    );
}
function Emporio(suit, rank) {
    var id = 'emporio:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        // Card onPlay
        step => {
            step.player.hand.discard(this.id);
            var alive = step.game.players.filter(p => p.alive);
            var current = alive[alive.indexOf(step.player)];
            var cards = step.phase.cards.draw(alive.length);
            handleEmporio(step, alive, current, cards);
        }
    );
}

function getBangEveryoneEvent(game, player, cardFilter, onResolved) {
    var composition = new events.ComposedEvent(
        game.players
            .filter(p => p.alive && p !== player)
            .map(p => {
                var delegate = new events.DelegateEvent(
                    new events.CardChoiceEvent(
                        game, p, p.hand.filter(cardFilter),
                        // onChoice
                        card => {
                            p.hand.discard(card.id);
                            delegate.event = null;
                        },
                        // onCancel
                        () => delegate.event = p.damage(1, () => delegate.event = null)
                    ),
                    // onDelegate resolved
                    () => composition.resolved(delegate)
                );
                return delegate;
            }),
        // onComposition resolved
        onResolved
    );
    return composition;
}
function Gatling(suit, rank) {
    var id = 'gatling:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => {
            step.player.hand.discard(this.id);
            step.event = misc.merge(getBangEveryoneEvent(
                step.game, step.player, c => c instanceof Mancato,
                () => step.event = null
            ), {
                format: () => ({
                    name: 'Gatling'
                })
            });
        }
    );
}
function Indians(suit, rank) {
    var id = 'indians:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => {
            step.player.hand.discard(this.id);
            step.event = misc.merge(getBangEveryoneEvent(
                step.game, step.player, c => c instanceof Bang,
                () => step.event = null
            ), {
                format: () => ({
                    name: 'Indians'
                })
            });
        }
    );
}

function Panico(suit, rank) {
    var id = 'panico:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        // Card onPlay
        step => {
            var delegate = new events.DelegateEvent(
                new events.TargetEvent(
                    step.game, step.player, false, step.player.stat('range'),
                    // Target onTarget
                    target => delegate.event = new events.CardChoiceEvent(
                        step.game, step.player,
                        target.equipped.concat(target.hand.map((c, i) => ({ id: 'hand:' + i}))),
                        // CardChoice onChoice
                        choice => {
                            step.player.hand.discard(this.id);
                            var card;
                            if (choice.id.startsWith('hand:')) {
                                var index = choice.id.substring('hand:'.length);
                                card = target.hand.remove(target.hand[index].id);
                            } else {
                                card = target.equipped.remove(choice.id);
                            }
                            step.player.hand.push(card);
                            delegate.event = null;
                        },
                        // CardChoice onCancel
                        () => delegate.event = null
                    ),
                    // Target onCancel
                    () => delegate.event = null
                ),
                // Delegate onResolved
                () => step.event = null
            );
            step.event = delegate;
        }
    );
}

function CatBalou(suit, rank) {
    var id = 'catbalou:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        // Card onPlay
        step => {
            var delegate = new events.DelegateEvent(
                new events.TargetEvent(
                    step.game, step.player, false, 1000,
                    // Target onTarget
                    target => delegate.event = new events.CardChoiceEvent(
                        step.game, step.player,
                        target.equipped.concat(target.hand.map((c, i) => ({ id: 'hand:' + i}))),
                        // CardChoice onChoice
                        card => {
                            step.player.hand.discard(this.id);
                            if (card.id.startsWith('hand')) {
                                var index = card.id.substring('hand:'.length);
                                target.hand.discard(target.hand[index].id);
                            } else {
                                target.equipped.discard(card.id);
                            }
                            delegate.event = null;
                        },
                        // CardChoice onCancel
                        () => delegate.event = null
                    ),
                    // Target onCancel
                    () => delegate.event = null
                ),
                // Delegate onResolved
                () => step.event = null
            );
            step.event = delegate;
        }
    );
}

function handleDuel(step, source, target) {
    step.event = events.CardChoiceEvent(
        step.game, target, target.hand.filter(c => c instanceof Bang),
        // onChoice
        card => {
            target.hand.discard(card.id);
            handleDuel(step, target, source);
        },
        // onCancel
        () => step.event = target.damage(1, () => step.event = null),
        // format
        () => ({
            name: 'Duel',
            source: source.name,
            target: target.name
        })
    );
}
function Duel(suit, rank) {
    var id = 'duel:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        step => true,
        step => {
            step.event = new events.TargetEvent(
                step.game, step.player, false, 1000,
                // Target onTarget
                target => {
                    step.player.hand.discard(this.id);
                    handleDuel(step, step.player, target);
                },
                // Target onCancel
                () => step.event = null
            );
        }
    );
}

module.exports = {
    Bang: Bang,
    Mancato: Mancato,
    Beer: Beer,
    Saloon: Saloon,
    Stagecoach: Stagecoach,
    WellsFargo: WellsFargo,
    Emporio: Emporio,
    Gatling: Gatling,
    Indians : Indians,
    Panico: Panico,
    CatBalou: CatBalou,
    Duel: Duel
};