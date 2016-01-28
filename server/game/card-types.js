var log = aReq('server/log'),
    Card = aReq('server/game/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

function Bang(suit, rank) {
    Card.call(this,
        'bang', suit, rank, Card.types.brown,
        // Filter
        step => step.bangs < step.player.stat('bangs'),
        // onPlay
        (step, onResolved) => events.TargetBang(
            step.player, step.game.players,
            // onTarget; trying to bang someone
            target => {
                step.player.hand.discard(this.id);
                step.bangs++;
                onResolved(events.CardTypeEvent(
                    target, Mancato,
                    // onCard; damage avoided
                    card => onResolved(target.hand.discard(card.id)),
                    // onCancel; damage goes through
                    () => onResolved(target.damage(1, onResolved))
                ));
            },
            // onCancel; no card was used
            () => onResolved()
        )
    );
}
misc.extend(Card, Bang);

function Mancato(suit, rank) {
    Card.call(this, 'mancato', suit, rank, Card.types.brown);
}
misc.extend(Card, Mancato);

function Beer(suit, rank) {
    Card.call(this,
        'beer', suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => {
            step.player.hand.discard(this.id);
            step.player.heal(1);
        }
    );
}
misc.extend(Card, Beer);
Beer.getDeathEvent = (player, onResolved) => events.CardTypeEvent(
    player, Beer,
    // onChoice
    card => {
        player.hand.discard(card.id);
        player.heal(1);
        onResolved();
    },
    // onCancel
    () => onResolved(),
    // format
    () => ({
        name: 'Dying',
        player: player.name
    })
);

function Saloon(suit, rank) {
    var id = 'saloon:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => {
            step.player.hand.discard(this.id);
            step.game.players
                .filter(p => p.alive)
                .forEach(p => p.heal(1));
        }
    );
}
misc.extend(Card, Saloon);

function handleDrawCard(player, card, amount) {
    player.hand.discard(card.id);
    player.hand.drawFromPile(amount);
}
function Stagecoach(suit, rank) {
    var id = 'stagecoach:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => handleDrawCard(step.player, this, 2)
    );
}
misc.extend(Card, Stagecoach);
function WellsFargo(suit, rank) {
    var id = 'wellsfargo:' + suit + ':' + rank;
    Card.call(this, id, suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => handleDrawCard(step.player, this, 3)
    );
}
misc.extend(Card, WellsFargo);

function handleEmporio(players, player, cards, onResolved) {
    return events.CardChoiceEvent(
        player, cards,
        // onChoice
        card => {
            player.hand.push(misc.remove(cards, card));
            onResolved(cards.length ?
                handleEmporio(players, misc.after(players, player), cards, onResolved) :
                undefined
            );
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
    Card.call(this,
        'emporio', suit, rank, Card.types.brown,
        // Filter
        () => true,
        // onPlay
        (step, onResolved) => {
            step.player.hand.discard(this.id);
            var alive = step.game.players.filter(p => p.alive);
            var current = alive[alive.indexOf(step.player)];
            var cards = step.phase.cards.draw(alive.length);
            return handleEmporio(alive, current, cards, onResolved);
        }
    );
}
misc.extend(Card, Emporio);

function getBangEveryoneEvent(players, player, responseType, onResolved) {
    var others = players.filter(p => p.alive && p !== player);
    return events.ComposedEvent(
        players.filter(p => p.alive && p !== player),
        (other, onSubResolved) => events.CardTypeEvent(
            other, responseType,
            card => {
                other.hand.discard(card.id);
                onSubResolved();
            },
            () => onSubResolved(other.damage(1, onSubResolved))
        ),
        () => onResolved()
    );
}
function Gatling(suit, rank) {
    Card.call(this,
        'gatling', suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => {
            step.player.hand.discard(this.id);
            return getBangEveryoneEvent(step.game.players, step.player, Mancato, onResolved);
        }
    );
}
misc.extend(Card, Gatling);

function Indians(suit, rank) {
    Card.call(this,
        'indians', suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => {
            step.player.hand.discard(this.id);
            return getBangEveryoneEvent(step.game.players, step.player, Bang, onResolved);
        }
    );
}
misc.extend(Card, Indians);

function Panico(suit, rank) {
    Card.call(this,
        'panico', suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => events.TargetDistance(
            step.player, step.game.players,
            // onTarget; panicking someone
            target => onResolved(events.RemoveOtherCard(
                step.player, target, true, true,
                card => {
                    step.player.hand.discard(this.id);
                    step.player.hand.push(card);
                    onResolved();
                },
                () => onResolved()
            )),
            // onCancel; the panico was not used
            () => onResolved()
        )
    );
}
misc.extend(Card, Panico);

function CatBalou(suit, rank) {
    Card.call(this,
        'catbalou', suit, rank, Card.types.brown,
        () => true,
        (step, onResolved) => events.TargetOthers(
            step.player, step.game.players,
            // onTarget; removing someone's card
            target => onResolved(events.RemoveOtherCard(
                step.player, target, true, true,
                card => {
                    step.player.hand.discard(this.id);
                    step.phase.cards.discarded.push(card);
                    onResolved();
                },
                // no choice; cancel
                () => onResolved()
            )),
            // onCancel; the catbalou was not used
            () => onResolved()
        )
    );
}
misc.extend(Card, CatBalou);

function handleDuel(source, target, onResolved) {
    return events.CardTypeEvent(
        target, Bang,
        // onChoice; duel is reversed
        card => {
            target.hand.discard(card.id);
            onResolved(handleDuel(target, source, onResolved));
        },
        // onCancel; target takes damage
        () => onResolved(target.damage(1, onResolved)),
        // format; who is banging who
        () => ({
            name: 'Duel',
            source: source.name,
            target: target.name
        })
    );
}
function Duel(suit, rank) {
    Card.call(this,
        'duel', suit, rank, Card.types.brown,
        () => true,
        // onPlay
        (step, onResolved) => events.TargetOthers(
            step.player, step.game.players,
            // onTarget
            target => {
                step.player.hand.discard(this.id);
                onResolved(handleDuel(step.player, target, onResolved));
            },
            // onCancel; no card was used
            () => onResolved()
        )
    );
}
misc.extend(Card, Duel);

function Equipment(name, suit, rank, slot, targetSrc, overrides) {
    this.slot = slot;
    Card.call(this,
        name, suit, rank, Card.types.blue,
        () => true,
        (step, onResolved) => targetSrc(
            step.player, step.game.players,
            // onTarget; applying equipment
            target => {
                step.player.hand.remove(this.id);
                var current = target.equipped.find(c => c.slot === this.slot);
                if (current) target.equipped.discard(current.id);
                target.equipped.push(this);
                onResolved();
            },
            () => onResolved()
        )
    );
    misc.merge(this, overrides);
}
misc.extend(Card, Equipment);

function Gun(name, suit, rank, overrides) {
    Equipment.call(this, name, suit, rank, 'weapon', events.TargetSelf, overrides);
}
misc.extend(Card, Gun);

function Mustang(suit, rank) {
    Equipment.call(this, 'mustang', suit, rank, 'mustang', events.TargetSelf, {
        distanceModifier: 1
    });
}
misc.extend(Card, Mustang);

function Mirino(suit, rank) {
    Equipment.call(this, 'mirino', suit, rank, 'mirino', events.TargetSelf, {
        bangRangeModifier: 1,
        rangeModifier: 1
    });
}
misc.extend(Card, Mirino);

function Barile() {
    var id = 'barile:' + suit + ':' + rank;
    Equipment.call(this, id, suit, rank, 'barile', events.TargetSelf, {
        // TODO barile
    });
}
misc.extend(Card, Barile);

function Prigione() {
    var id = 'prigione:' + suit + ':' + rank;
    Equipment.call(this, id, suit, rank, 'prigione', events.TargetAny, {
        // TODO prigione
    });
}
misc.extend(Card, Prigione);

function Dynamite() {
    var id = 'dynamite:' + suit + ':' + rank;
    Equipment.call(this, id, suit, rank, 'dynamite', events.TargetAny, {
        // TODO dynamite
    });
}
misc.extend(Card, Dynamite);

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
    Duel: Duel,
    Gun: Gun,
    Mustang : Mustang,
    Mirino: Mirino,
    Barile: Barile,
    Prigione: Prigione,
    Dynamite: Dynamite
};