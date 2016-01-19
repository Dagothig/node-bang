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

function CardChoiceEvent(game, player, cards, onChoice, onCancel, format) {
    return {
        actionsFor: function(p) {
            if (p !== player) return {};
            var acts = {};
            acts[actions.play] = cards.map(c => c.id);
            if (onCancel) acts[actions.cancel] = [actions.cancel];
            return acts;
        },
        handleAction: function(p, msg) {
            if (p !== player) return;
            if (msg.action === actions.play) {
                var card = cards.find(c => c.id === msg.arg);
                if (card) onChoice(card);
            } else if (onCancel && msg.action === actions.cancel) {
                onCancel();
            }
        },
        format: format
    };
}

function DelegateEvent(event, onResolved) {
    var delegate = {
        get event() { return this._event; },
        set event(event) {
            if (event) this._event = event;
            else onResolved();
        },
        get actionsFor() { return this.event.actionsFor; },
        get handleAction() { return this.event.handleAction; },
        get format() { return this.event.format; }
    };
    if (event) delegate.event = event;
    return delegate;
}

function ComposedEvent(events, onResolved) {
    var delegate = {
        events: events,
        actionsFor: function(p) {
            return this.events.reduce((a, e) => misc.merge(a, e.actionsFor(p)), {});
        },
        handleAction: function(p, msg) {
            return this.events.map(e => e.handleAction(p, msg));
        },
        format: function() {
            return this.events.reduce((f, e) => misc.merge(f, e.format()), {});
        },
        resolved: function(event) {
            this.events.splice(this.events.indexOf(event), 1);
            if (!this.events.length) onResolved();
        }
    };
    return delegate;
}

module.exports = {
    TargetEvent: TargetEvent,
    CardChoiceEvent: CardChoiceEvent,
    DelegateEvent: DelegateEvent,
    ComposedEvent: ComposedEvent
}