'use strict';

var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc');

var TargetEvent = (player, targets, onTarget, onCancel, format) => ({
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
});

var TargetAny = (player, players, onTarget, onCancel, format) => new TargetEvent(
    player,
    players.filter(p => p.alive),
    onTarget, onCancel, format
);

var TargetOthers = (player, players, onTarget, format) => new TargetEvent(
    player,
    players.filter(p => p.alive && p !== player),
    onTarget, onCancel, format
);

var TargetRange = (player, players, range, onTarget, format) => {
    let alive = players.filter(p => p.alive && p !== player);
    return new TargetEvent(
        player,
        alive.filter(p => player.distanceTo(alive, p) <= range),
        onTarget, onCancel, format
    );
};

var TargetBang = (player, players, onTarget, format) =>
    TargetRange(player, players, player.stat('bangRange'), onTarget, format);

var TargetDistance = (player, players, onTarget, format) =>
    TargetRange(player, players, player.stat('distance'), onTarget, format);

var CardChoiceEvent = (player, cards, onChoice, onCancel, format) => ({
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
});

var CardTypeEvent = (player, cardType, onChoice, onCancel, format) => new CardChoiceEvent(
    player,
    player.hand.filter(c => c instanceof cardType),
    onChoice, onCancel, format
);

var RemoveOtherCard = (
    player, target, withHand, withEquipment, onChoice, onCancel, format
) => new CardChoiceEvent(
    player,
    misc.FromArrays(
        (withHand && target.hand.length) ? { id: 'hand' } : [],
        withEquipment ? target.equipped : []
    ),
    card => onChoice(choice.id === 'hand' ?
        misc.spliceRand(target.hand) :
        target.equipped.remove(choice.id)
    ),
    onCancel, format
);

var DelegateEvent = (onEvent, onResolved) => ({
    _event: onEvent(event => this.event = event),
    get event() { return this._event; },
    set event(event) {
        if (event) this._event = event;
        else onResolved();
    },
    get actionsFor() { return this.event.actionsFor; },
    get handleAction() { return this.event.handleAction; },
    get format() { return this.event.format; }
});

var ComposedEvent = (elements, eventFunc, onResolved) => ({
    events: eventsFunc((oldEvent, newEvent) => {
        misc.remove(this.events, oldEvent);
        if (newEvent) this.events.push(newEvent);
        if (!this.events.length) onResolved();
    }),
    actionsFor: function(p) {
        return this.events.reduce((a, e) => misc.merge(a, e.actionsFor(p)), {});
    },
    handleAction: function(p, msg) {
        return this.events.map(e => e.handleAction(p, msg));
    },
    format: function() {
        return this.events.reduce((f, e) => misc.merge(f, e.format()), {});
    }
});

module.exports = {
    TargetEvent: TargetEvent,
    TargetAny: TargetAny,
    TargetOthers: TargetOthers,
    TargetRange: TargetRange,
    TargetBang: TargetBang,
    TargetDistance: TargetDistance,
    CardChoiceEvent: CardChoiceEvent,
    CardTypeEvent: CardTypeEvent,
    RemoveOtherCard: RemoveOtherCard,
    DelegateEvent: DelegateEvent,
    ComposedEvent: ComposedEvent
}