'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = aReq('server/game/event'),
    Choice = aReq('server/game/choice');

function CardsDrawEvent(player, cards, amount, onDraw, onCancel, format) {
    Event.call(this, [
        onDraw && new Choice(player, actions.draw),
        onCancel && new Choice(player, actions.cancel)
    ], format);
    this.cards = cards;
    this.amount = amount;
    this.onDraw = onDraw;
    this.onCancel = onCancel;
}
CardsDrawEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: CardsDrawEvent,
    handleDraw: function(state, player, choice) {
        this.onDraw(this.cards.draw(this.amount));
    },
    handleCancel: function(state, player, arg) { this.onCancel(); }
});

module.exports = CardsDrawEvent;