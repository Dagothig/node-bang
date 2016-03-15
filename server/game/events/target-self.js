'use strict';

var misc = aReq('server/misc'),
    TargetEvent = require('./target');

function TargetSelfEvent(player, players, onTarget, onCancel, format) {
    TargetEvent.call(this, player, player, onTarget, onCancel, format);
}
TargetSelfEvent.prototype = misc.merge(Object.create(TargetEvent.prototype), {
    constructor: TargetSelfEvent
});

module.exports = TargetSelfEvent;