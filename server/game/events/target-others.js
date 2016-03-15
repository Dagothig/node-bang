'use strict';

var misc = aReq('server/misc'),
    TargetEvent = require('./target');

function TargetOthersEvent(player, players, onTarget, onCancel, format) {
    TargetEvent.call(this,
        player,
        players.filter(p => p.alive && p != player),
        onTarget, onCancel, format
    );
}
TargetOthersEvent.prototype = misc.merge(Object.create(TargetEvent.prototype), {
    constructor: TargetOthersEvent
});

module.exports = TargetOthersEvent;