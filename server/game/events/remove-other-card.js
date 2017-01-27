'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = require('./event'),
    Choice = require('./choice');

function RemoveOtherCardEvent(
    player, targets, withHand, withEquipment, onChoice, onCancel, format
) {
    Event.call(this, player, targets.reduce(
        (choices, target) => {
            if (!onChoice) return choices;

            let action = actions.choose + '-' + target.name;
            choices.push(new Choice(action, misc.fromArrays(
                (withHand && target.hand.length) ? [{ id: 'hand' }] : [],
                withEquipment ? target.equipped : []
            ), c => c.id))

            this['handle' + misc.capitalize(action)] = (player, choice) =>
                this.handleChoose(player, target, choice);

            return choices;
        },
        [onCancel &&
            new Choice(actions.cancel, onCancel.arg && [onCancel.arg])]
    ), format);
    this.onChoice = onChoice;
    this.onCancel = onCancel;
}
RemoveOtherCardEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: RemoveOtherCardEvent,
    handleChoose: function(player, target, choice) {
        if (choice.id === 'hand') {
            let card = target.hand.removeRand();
            if (card) this.onChoice(target, 'hand', card);
        }
        else {
            let card = target.equipped.remove(choice.id);
            if (card) this.onChoice(target, 'equipped', card);
        }
    },
    handleCancel: function() { this.onCancel(); }
});

module.exports = RemoveOtherCardEvent;