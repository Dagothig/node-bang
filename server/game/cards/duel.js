var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    handles = aReq('server/game/handles'),
    Bang = aReq('server/game/cards/attacking').Bang;

function Duel(suit, rank) {
    Card.call(this, 'duel', suit, rank);
}
misc.extend(Card, Duel, {
    handlePlay: function(step, onResolved) {
        onResolved(events('targetOthers')(
            step.player, step.game.players,
            // onTarget
            target => {
                step.player.hand.discard(this.id);
                this.handleDuel(step, step.player, target, onResolved);
            },
            // onCancel; no card was used
            () => onResolved()
        ));
    },
    handleDuel: function(step, source, target, onResolved) {
        onResolved(events('cardType', target, step)(
            target, Bang,
            // onChoice; duel is reversed
            card => {
                target.hand.discard(card.id);
                this.handleDuel(step, target, source, onResolved);
            },
            // onCancel; target takes damage
            misc.merge(
                () => handles.damage(step, source, target, 1, onResolved),
                { arg: 'lose duel' }
            ),
            // format; who is banging who
            () => ({
                for: 'duel',
                source: source.name,
                target: target.name
            })
        ));
    }
});

module.exports = Duel;