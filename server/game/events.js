'use strict';

var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = aReq('server/game/event'),
    Choice = aReq('server/game/choice');

var targetEvent = (player, targets, onTarget, onCancel, format) => ({
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

var targetOthers = (player, players, onTarget, onCancel, format) => targetEvent(
    player,
    players.filter(p => p.alive && p !== player),
    onTarget, onCancel, format
);

var targetSelf = (player, players, onTarget, onCancel, format) => onTarget(player);

var targetRange = (player, players, range, onTarget, onCancel, format) => {
    let alive = players.filter(p => p.alive);
    return targetEvent(
        player,
        alive.filter(p => player.distanceTo(alive, p) <= range)
            .filter(p => p !== player),
        onTarget, onCancel, format
    );
};

var cardChoiceEvent = (player, cards, onChoice, onCancel, format) => ({
    player: player,
    cards: cards,
    onChoice: onChoice,
    onCancel: onCancel,
    actionsFor: function(p) {
        if (p !== this.player) return {};
        var acts = {};
        acts[actions.choose] = this.cards.map(c => c.id);
        if (this.onCancel) acts[actions.cancel] = [actions.cancel];
        return acts;
    },
    handleAction: function(p, msg) {
        if (p !== this.player) return;
        if (msg.action === actions.choose) {
            var card = this.cards.find(c => c.id === msg.arg);
            if (card) this.onChoice(card);
        } else if (this.onCancel && msg.action === actions.cancel) {
            this.onCancel();
        }
    },
    format: format,
    filterCards: function(filter) {
        this.cards = this.cards.filter(filter);
        return this;
    }
});

var cardTypesEvent = (player, cardTypes, onChoice, onCancel, format) =>
cardChoiceEvent(
    player,
    player.hand.filter(c => cardTypes.find(cardType => c instanceof cardType)),
    onChoice, onCancel, format
);
var cardTypeEvent = (player, cardType, onChoice, onCancel, format) =>
cardTypesEvent(player, [cardType], onChoice, onCancel, format);

var cardsDrawEvent = (player, cards, amount, onDraw, onCancel, format) => ({
    actionsFor: function(p) {
        if (p !== player) return {};
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
var cardDrawEvent = (player, cards, onDraw, onCancel, format) =>
    cardsDrawEvent(player, cards, 1, cards => onDraw(cards[0]), onCancel, format);

var removeOtherCard = (
    player, target, withHand, withEquipment, onChoice, onCancel, format
) => cardChoiceEvent(
    player,
    misc.fromArrays(
        (withHand && target.hand.length) ? [{ id: 'hand' }] : [],
        withEquipment ? target.equipped : []
    ),
    choice => onChoice(choice.id === 'hand' ?
        target.hand.removeRand() :
        target.equipped.remove(choice.id)
    ),
    onCancel, format
);

var composedEvent = (elements, generator, onResolved) => {
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
var delegate = () => ({
    get actionsFor() {
        return this.event.actionsFor;
    },
    get handleAction() {
        return this.event.handleAction;
    },
    get format() {
        return this.event.format;
    }
});

var events = misc.merge((eventName, player) => {
    // Since we want to return a function that behaves as if called on the proper
    // object and since lambdas cannot reference the arguments object, then we must
    // create a function to delegate the call on the proper object
    if (player && player.character[eventName]) return function() {
        return player.character[eventName].apply(player.character, arguments);
    }
    else return events.raw[eventName];
}, {
    raw: {
        target: targetEvent,
        targetOthers: targetOthers,
        targetSelf: targetSelf,
        targetRange: targetRange,
        cardChoice: cardChoiceEvent,
        cardType: cardTypeEvent,
        cardsDraw: cardsDrawEvent,
        cardDraw: cardDrawEvent,
        removeOtherCard: removeOtherCard,
        composed: composedEvent,
        delegate: delegate
    },
    start: (event) => {
        event.timer = setInterval(() => {
            event.end();
        }, 1000);
    },
    end: (event) => {
        if (event.timer) clearTimeout(event.timer);
    },
    handleDefault: (event, p) => {
        let acts = event.actionsFor(p);

        let action = acts[actions.cancel] ?
            actions.cancel :
            misc.spliceRand(Object.keys(acts));

        event.handleAction(p, {
            action: action,
            arg: misc.spliceArg(acts[action])}
        );
    }
});
module.exports = events;