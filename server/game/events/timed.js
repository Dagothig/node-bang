'use strict';

let Event = require('./event');

function TimedEvent(time, onFinished, format) {
    this.time = time;
    this.onFinished = onFinished;
    this.format = format;
}
TimedEvent.prototype = {
    constructor: TimedEvent,
    get name() { return this.constructor.name; },

    isTrivial: () => false,
    truncateIfTrivial: function() { return this; },
    actionsFor: player => {},
    handleAction: (player, msg) => false,
    handleDefault: player => false,
    update: function(delta) {
        this.time -= delta;
        if (this.time <= 0) {
            this.onFinished();
            return true;
        }
        return false;
    }
};

module.exports = TimedEvent;