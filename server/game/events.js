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

var TargetAny = (player, players, onTarget, onCancel, format) => TargetEvent(
    player,
    players.filter(p => p.alive),
    onTarget, onCancel, format
);

var TargetOthers = (player, players, onTarget, onCancel, format) => TargetEvent(
    player,
    players.filter(p => p.alive && p !== player),
    onTarget, onCancel, format
);

var TargetSelf = (player, players, onTarget, onCancel, format) => onTarget(player);

var TargetRange = (player, players, range, onTarget, onCancel, format) => {
    let alive = players.filter(p => p.alive);
    return TargetEvent(
        player,
        alive.filter(p => player.distanceTo(alive, p) <= range)
            .filter(p => p !== player),
        onTarget, onCancel, format
    );
};

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

var CardTypeEvent = (player, cardType, onChoice, onCancel, format) =>
CardChoiceEvent(
    player,
    player.hand.filter(c => c instanceof cardType),
    onChoice, onCancel, format
);

var CardsDrawEvent = (player, cards, amount, onDraw, onCancel, format) => ({
    actionsFor: function(p) {
        if (p !== player) return;
        var acts = {};
        acts[actions.draw] = [actions.draw];
        if (onCancel) acts[actions.cancel] = [actions.cancel];
        return acts;
    },
    handleAction: function(p, msg) {
        if (p !== player) return;
        if (msg.action === actions.draw) onDraw(cards.draw(amount));
        else if (onCancel && msg.action === actions.cancel) onCancel();
    },
    format: format
});
var CardDrawEvent = (player, cards, onDraw, onCancel, format) =>
    CardsDrawEvent(player, cards, 1, cards => onDraw(cards[0]), onCancel, format);

var RemoveOtherCard = (
    player, target, withHand, withEquipment, onChoice, onCancel, format
) => CardChoiceEvent(
    player,
    misc.fromArrays(
        (withHand && target.hand.length) ? [{ id: 'hand' }] : [],
        withEquipment ? target.equipped : []
    ),
    choice => onChoice(choice.id === 'hand' ?
        misc.spliceRand(target.hand) :
        target.equipped.remove(choice.id)
    ),
    onCancel, format
);

var ComposedEvent = (elements, generator, onResolved) => {
    var event = {
        events: new Array(elements.length),
        resolveEvent: function(i, newEvent) {
            this.events[i] = newEvent;
            if (!this.events.filter(e => e).length) onResolved();
        },
        actionsFor: function(p) {
            return this.events.reduce(
                (a, e) => e ? misc.merge(a, e.actionsFor(p)) : a,
                {}
            );
        },
        handleAction: function(p, msg) {
            return this.events.map(e => e ? e.handleAction(p, msg) : undefined);
        },
        format: function() {
            return this.events.reduce(
                (f, e) => (e && e.format) ? misc.merge(f, e.format()) : f,
                {}
            );
        }
    };
    elements.forEach((e, i) => generator(e, n => event.resolveEvent(i, n)));
    return event;
};

module.exports = {
    TargetEvent: TargetEvent,
    TargetAny: TargetAny,
    TargetOthers: TargetOthers,
    TargetSelf: TargetSelf,
    TargetRange: TargetRange,
    CardChoiceEvent: CardChoiceEvent,
    CardTypeEvent: CardTypeEvent,
    CardsDrawEvent: CardsDrawEvent,
    CardDrawEvent: CardDrawEvent,
    RemoveOtherCard: RemoveOtherCard,
    ComposedEvent: ComposedEvent
};