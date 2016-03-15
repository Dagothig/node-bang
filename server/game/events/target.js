'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = aReq('server/game/event'),
    Choice = aReq('server/game/choice');

function TargetEvent(player, targets, onTarget, onCancel, format) {
    Event.call(this, [
        onTarget && new Choice(player, actions.target, targets, t => t.name),
        onCancel && new Choice(player, actions.cancel)
    ], format);
    this.onTarget = onTarget;
    this.onCancel = onCancel;

    if (targets.length === 1) onTarget(targets[0]);
}
TargetEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: TargetEvent,
    handleTarget: function(state, player, target) { this.onTarget(target); },
    handleCancel: function(state, player, arg) { this.onCancel(); }
});

module.exports = TargetEvent;