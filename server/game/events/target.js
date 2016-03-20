'use strict';

var actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    Event = require('./event'),
    Choice = require('./choice');

function TargetEvent(player, targets, onTarget, onCancel, format) {
    Event.call(this, player, [
        onTarget && new Choice(actions.target, targets, t => t.name),
        onCancel && new Choice(actions.cancel)
    ], format);
    this.onTarget = onTarget;
    this.onCancel = onCancel;

    if (targets.length === 1) onTarget(targets[0]);
}
TargetEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: TargetEvent,
    handleTarget: function(player, target) { this.onTarget(target); },
    handleCancel: function(player, arg) { this.onCancel(); }
});

module.exports = TargetEvent;