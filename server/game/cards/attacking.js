var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    handles = aReq('server/game/cards/handles');

function Bang(suit, rank) {
    Card.call(this, 'bang', suit, rank, Card.types.brown);
}
misc.extend(Card, Bang, {
    filter: function(step) { return step.bangs < step.player.stat('bangs'); },
    handlePlay: function(step, onResolved) {
        onResolved(events.TargetRange(
            step.player, step.game.players, step.player.stat('bangRange'),
            // onTarget; trying to bang someone
            target => {
                step.player.hand.discard(this.id);
                step.bangs++;
                handles.bang(step, this, target, onResolved);
            },
            // onCancel; no card was used
            () => onResolved()
        ))
    }
});

function Mancato(suit, rank) {
    Card.call(this, 'mancato', suit, rank, Card.types.brown);
}
misc.extend(Card, Mancato, {
    filter: function(step) { return false; }
});

function Gatling(suit, rank) {
    Card.call(this, 'gatling', suit, rank, Card.types.brown);
}
misc.extend(Card, Gatling, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        onResolved(events.ComposedEvent(
            step.game.players.filter(p => p.alive && p !== step.player),
            (other, onSubResolved) => handles.bang(step, this, other, onSubResolved),
            onResolved
        ));
    }
});

function Indians(suit, rank) {
    Card.call(this, 'indians', suit, rank, Card.types.brown);
}
misc.extend(Card, Indians, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        onResolved(events.ComposedEvent(
            step.game.players.filter(p => p.alive && p !== step.player),
            (other, onSubRes) => handles.indians(step, this, other, onSubRes),
            onResolved
        ));
    }
});

module.exports = {
    Bang: Bang,
    Mancato: Mancato,
    Gatling: Gatling,
    Indians: Indians
};