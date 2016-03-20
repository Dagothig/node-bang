'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = require('./event'),
    Choice = require('./choice');

function CardChoiceEvent(player, cards, onChoice, onCancel, format) {
    Event.call(this, player, [
        onChoice && new Choice(actions.choose, cards, c => c.id),
        onCancel && new Choice(actions.cancel)
    ], format);
    this.onChoice = onChoice;
    this.onCancel = onCancel;
}
CardChoiceEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: CardChoiceEvent,
    handleChoose: function(player, choice) { this.onChoice(choice); },
    handleCancel: function(player, arg) { this.onCancel(); },
    filterCards: function(filter) {
        Event.call(this, this.choices.filter(choice =>
            choice.action !== actions.choose || choice.args.filter(filter)
        ), this.format);
        return this;
    }
});

module.exports = CardChoiceEvent;