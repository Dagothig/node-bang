'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = require('./event'),
    Choice = require('./choice');

function RemoveOtherCardEvent(
    player, targets, withHand, withEquipment, onChoice, onCancel, format
) {
    Event.call(this, player, targets.reduce((choices, target) => {
        if (!onChoice) return choices;

        let action = actions.choose + '-' + target.name;
        choices.push(new Choice(action, misc.fromArrays(
            withHand ? [{ id: 'hand' }] : [],
            withEquipment ? target.equipped : []
        ), c => c.id))

        this['handle' + misc.capitalize(action)] = (player, choice) =>
            this.handleChoose(player, target, choice);

        return choices;
    }, [onCancel && new Choice(actions.cancel)]), format);
    this.onChoice = onChoice;
    this.onCancel = onCancel;
}
RemoveOtherCardEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: RemoveOtherCardEvent,
    handleChoose: function(player, target, choice) {
        if (choice.id === 'hand')
            this.onChoice(target, 'hand', target.hand.removeRand());
        else
            this.onChoice(target, 'equipped', target.equipped.remove(choice.id));
    },
    handleCancel: function() {
        this.onCancel();
    }
});

module.exports = RemoveOtherCardEvent;