'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = require('./event'),
    CCE = require('./card-choice');

function RemoveOtherCardEvent(
    player, target, withHand, withEquipment, onChoice, onCancel, format
) {
    CCE.call(this, player, misc.fromArrays(
        (withHand && target.hand.length) ? [{ id: 'hand' }] : [],
        withEquipment ? target.equipped : []
    ), onChoice, onChoice, format);
    this.target = target;
}
RemoveOtherCardEvent.prototype = misc.merge(Object.create(CCE.prototype), {
    constructor: RemoveOtherCardEvent,
    handleChoose: function(player, choice) {
        this.onChoice(choice.id === 'hand' ?
            this.target.hand.removeRand() :
            this.target.equipped.remove(choice.id)
        );
    }
});

module.exports = RemoveOtherCardEvent;