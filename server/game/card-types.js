var log = aReq('server/log'),
    Card = aReq('server/game/card'),
    events = aReq('server/game/events');

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
        () => delete step.event
    );
}
function getBangResponseEvent(step, target) {
    return new events.CardChoiceEvent(
        step.game, target,
        // filter
        card => card instanceof Mancato,
        // onChoice
        card => {
            target.hand.discard(card.id);
            delete step.event;
        },
        // onCancel
        () => step.event = target.damage(1, () => {
            delete step.event;
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
        game, player,
        // filter
        card => card instanceof Beer,
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

module.exports = {
    Bang: Bang,
    Mancato: Mancato,
    Beer: Beer,
    Saloon: Saloon
}