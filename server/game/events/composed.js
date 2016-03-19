'use strict';

var misc = aReq('server/misc');

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
    }

    resolveEvent: function(i, newEvent) {
        this.events[i] = newEvent;
        if (!this.events.filter(e => e).length) this.onResolved();
    },

    actionsFor: function(state, player) {
        return this._reduce('actionsFor', state, player);
    },

    handleAction: function(state, player, msg) {
        return this._map('handleAction', state, player, msg);
    },

    handleDefault: function(state, player) {
        return this._reduce('handleDefault', state, player);
    },

    format: function(state, player) {
        return this._reduce('format', state, player);
    },

    update: function(state, delta) {
        return this._map('update', state, delta);
    }
};

module.exports = ComposedEvent;