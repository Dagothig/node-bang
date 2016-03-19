'use strict';

var misc = aReq('server/misc');

function DelegateEvent(generator) {
    this.event = generator(newEvent => this.event = newEvent);
}
DelegateEvent.prototype = misc.merge({
    constructor: DelegateEvent,
    get name() { return this.constructor.name; },

    _delegateCall: function(func, args) {
        return this.event[func].apply(this.event, args);
    }
},
    ['actionsFor', 'handleAction', 'handleDefault', 'format', 'update']
    .reduce((proto, name) => Object.defineProperty(proto, name, {
        enumerable: true,
        value: function() {
            return this._delegateCall(name, arguments);
        }
    }), {})
);

module.exports = DelegateEvent;