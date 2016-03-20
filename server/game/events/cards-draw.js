'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = require('./event'),
    Choice = require('./choice');

function CardsDrawEvent(player, cards, amount, onDraw, onCancel, format) {
    Event.call(this, player, [
        onDraw && new Choice(actions.draw),
        onCancel && new Choice(actions.cancel)
    ], format);
    this.cards = cards;
    this.amount = amount;
    this.onDraw = onDraw;
    this.onCancel = onCancel;
}
CardsDrawEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: CardsDrawEvent,
    handleDraw: function(player, choice) {
        this.onDraw(this.cards.draw(this.amount));
    },
    handleCancel: function(player, arg) { this.onCancel(); }
});

module.exports = CardsDrawEvent;