'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = aReq('server/game/event'),
    Choice = aReq('server/game/choice');

function CardChoiceEvent(player, cards, onChoice, onCancel, format) {
    Event.call(this, [
        onChoice && new Choice(player, actions.choose, cards, c => c.id),
        onCancel && new Choice(player, actions.cancel)
    ], format);
    this.onTarget = onTarget;
    this.onCancel = onCancel;

    if (cards.length === 1) onChoice(cards[0]);
}
CardChoiceEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: CardChoiceEvent,
    handleChoice: function(state, player, choice) { this.onChoice(choice); },
    handleCancel: function(state, player, arg) { this.onCancel(); }
});

module.exports = CardChoiceEvent;