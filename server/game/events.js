var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc');

function TargetEvent(game, player, includePlayer, maxRange, onTarget, onCancel, format) {
    var alive = game.players.filter(p => p.alive);
    var filter = p => (includePlayer || p !== player)
        && player.distanceTo(alive, p) <= maxRange;
    var targets = alive.filter(filter);
    return {
        actionsFor: function(p) {
            if (p !== player) return {};
            var acts = {};
            acts[actions.target] = targets.map(p => p.user.name);
            acts[actions.cancel] = [actions.cancel];
            return acts;
        },
        handleAction: function(p, msg) {
            if (p !== player) return;
            if (msg.action === actions.target) {
                var target = targets.find(t => t.user.isName(msg.arg));
                if (!target) return;
                onTarget(target);
            } else if (msg.action === actions.cancel) {
                onCancel();
            }
        },
        format: format
    };
}

function CardChoiceEvent(game, player, filter, onChoice, onCancel, format) {
    return {
        actionsFor: function(p) {
            if (p !== player) return {};
            var acts = {};
            acts[actions.play] = player.hand.filter(filter).map(c => c.id);
            acts[actions.cancel] = [actions.cancel];
            return acts;
        },
        handleAction: function(p, msg) {
            if (p !== player) return;
            if (msg.action === actions.play) {
                var card = player.hand.find(c => c.id === msg.arg);
                if (card && filter(card)) onChoice(card);
            } else if (msg.action === actions.cancel) {
                onCancel();
            }
        },
        format: format
    }
}

module.exports = {
    TargetEvent: TargetEvent,
    CardChoiceEvent: CardChoiceEvent
}