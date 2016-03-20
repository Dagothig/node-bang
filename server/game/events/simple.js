'use strict';

var misc = aReq('server/misc'),
    Event = require('./event'),
    Choice = require('./choice');

function SimpleEvent(player, action, args, handle, format) {
    Event.call(this, player, [new Choice(action, args)], format);
    this['handle' + misc.capitalize(action)] = handle;
}
SimpleEvent.prototype = misc.merge(Object.create(Event.prototype), {
    constructor: SimpleEvent
});

module.exports = SimpleEvent;