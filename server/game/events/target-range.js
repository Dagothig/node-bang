'use strict';

var misc = aReq('server/misc'),
    TargetEvent = require('./target');

function TargetRangeEvent(player, players, range, onTarget, onCancel, format) {
    let alive = players.filter(p => p.alive);
    TargetEvent.call(this,
        player,
        alive.filter(p => player !== p && player.distanceTo(alive, p) <= range),
        onTarget, onCancel, format
    );
}
TargetRangeEvent.prototype = misc.merge(Object.create(TargetEvent.prototype), {
    constructor: TargetRangeEvent
});

module.exports = TargetRangeEvent;