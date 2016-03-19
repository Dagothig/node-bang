'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    consts = aReq('shared/consts');

function Event(choices, format) {
    this.time = consts.eventMaxTime;
    this.choices = choices.filter(c => c);
    this.actions = this.choices.reduce((obj, c) => {
        var acts = obj[c.player.name] = obj[c.player.name] || {};
        acts[c.action] = c.mapped;
        return obj;
    }, {});
    this.format = format;
}
Event.prototype = {
    constructor: Event,
    get name() { return this.constructor.name; },

    _defaultArgForAction: function(state, player, actions, action) {
        var args = actions[action];
        return {
            action: action,
            arg: (args.length === 1) ? args[0] : misc.rand(args)
        };
    },
    _defaultActionFor: function(state, player) {
        var acts = this.actionsFor(state, player);
        return this._defaultArgForAction(state, player, acts,
            acts[actions.cancel] ? actions.cancel : Misc.rand(Object.keys(acts))
        );
    },

    actionsFor: function(state, player) {
        return this.actions[player.name];
    },

    handleAction: function(state, player, msg) {
        var choice = this.choices.find(c => c.is(player, msg));
        if (!choice) return;
        var arg = choice.args.find(a => c.argFunc(a) === msg.arg);
        if (!arg) return;
        this['handle' + misc.capitalize(choice.action)](state, player, arg);
    },

    handleDefault: function(state, player) {
        return this.handleAction(state, player, this._defaultActionFor(player));
    },

    format: function(state, player) {
        return misc.merge({
            name: this.name,
            time: this.time,
            event: (this.event && this.event.format) ?
                this.event.format(state, player) : undefined
        }, (this.format && this.format(state, player)) || {});
    },

    update: function(state, delta) {
        this.time -= delta;
        if (this.time <= 0) this.handleDefault();
    }
};

module.exports = Event;