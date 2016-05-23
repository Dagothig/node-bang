'use strict';

var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    handles = aReq('server/game/handles');

var handleBang = (step, card, target, onResolved) =>
    handles.attack('Bang', step, card, target, Mancato, onResolved);
var handleIndians = (step, card, target, onResolved) =>
    handles.attack('Indians', step, card, target, Bang, onResolved);
var handleGatling = (step, card, target, onResolved) =>
    handles.attack('Gatling', step, card, target, Mancato, onResolved);

function Bang(suit, rank) {
    Card.call(this, 'bang', suit, rank);
}
misc.extend(Card, Bang, {
    filter: function(step) { return step.bangs < step.player.stat('bangs'); },
    handlePlay: function(step, onResolved) {
        onResolved(events('targetRange')(
            step.player, step.game.players, step.player.stat('bangRange'),
            // onTarget; trying to bang someone
            target => {
                step.player.hand.discard(this.id);
                step.bangs++;
                handleBang(step, this, target, onResolved);
            },
            // onCancel; no card was used
            () => onResolved()
        ))
    }
});

function Mancato(suit, rank) {
    Card.call(this, 'mancato', suit, rank);
}
misc.extend(Card, Mancato, {
    filter: function(step) { return false; }
});

function Gatling(suit, rank) {
    Card.call(this, 'gatling', suit, rank);
}
misc.extend(Card, Gatling, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        onResolved(misc.merge(events('composed')(
            step.game.players.filter(p => p.alive && p !== step.player),
            (other, onSubRes) => handleGatling(step, this, other, onSubRes),
            onResolved
        ), {
            format: function(player) {
                let formatted = this._reduce('format', player);
                formatted.player = this.events
                    .filter(ev => ev)
                    .map(ev => ev.player.name);
                return formatted;
            }
        }));
    }
});

function Indians(suit, rank) {
    Card.call(this, 'indians', suit, rank);
}
misc.extend(Card, Indians, {
    handlePlay: function(step, onResolved) {
        step.player.hand.discard(this.id);
        onResolved(misc.merge(events('composed')(
            step.game.players.filter(p => p.alive && p !== step.player),
            (other, onSubRes) => handleIndians(step, this, other, onSubRes),
            onResolved
        ), {
            format: function(player) {
                let formatted = this._reduce('format', player);
                formatted.player = this.events
                    .filter(ev => ev)
                    .map(ev => ev.player.name);
                return formatted;
            }
        }));
    }
});

module.exports = {
    Bang: Bang,
    Mancato: Mancato,
    Gatling: Gatling,
    Indians: Indians
};