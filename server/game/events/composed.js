'use strict';

var misc = aReq('server/misc'),
    consts = aReq('server/consts');

function ComposedEvent(elements, generator, onResolved) {
    this.events = new Array(elements.length);
    elements.forEach((e, i) => generator(e, n => this.resolveEvent(i, n)));
    this.onResolved = onResolved;
}
ComposedEvent.prototype = {
    constructor: ComposedEvent,
    get name() { return this.constructor.name; },

    _map: function(funcName) {
        var args = Array.from(arguments).slice(1);
        return this.events.map(e => e ? e[funcName].apply(e, args) : undefined);
    },
    _reduce: function(funcName) {
        var args = Array.from(arguments).slice(1);
        return this.events.reduce((obj, ev) =>
            ev ?
                misc.merge(obj, ev[funcName].apply(ev, args)) :
                obj,
            {}
        );
    },

    isTrivial: function() {
        return this.events.every(ev => ev.isTrivial());
    },

    truncateIfTrivial: function() {
        if (this.isTrivial)
            this.events.forEach(ev => ev.time = consts.eventTrivialTime);
        return this;
    },

    resolveEvent: function(i, newEvent) {
        this.events[i] = newEvent;
        if (!this.events.filter(e => e).length) this.onResolved();
    },

    actionsFor: function(player) {
        return this._reduce('actionsFor', player);
    },

    handleAction: function(player, msg) {
        let map = this._map('handleAction', player, msg);
        return map.find(handle => handle);
    },

    handleDefault: function(player) {
        return this._reduce('handleDefault', player);
    },

    format: function(player) {
        return this._reduce('format', player);
    },

    update: function(delta) {
        return this._map('update', delta).find(val => val);
    }
};

module.exports = ComposedEvent;