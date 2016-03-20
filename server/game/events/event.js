'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    consts = aReq('shared/consts');

function Event(player, choices, format) {
    this.player = player;
    this.time = consts.eventMaxTime;
    this.choices = choices.filter(c => c);
    this._actions = this.choices.reduce((acts, c) => {
        acts[c.action] = c.mapped;
        return acts;
    }, {});
    this.format = format;
}
Event.prototype = {
    constructor: Event,
    get name() { return this.constructor.name; },

    _defaultArgForAction: function(actions, action) {
        var args = actions[action];
        return {
            action: action,
            arg: (args.length === 1) ? args[0] : misc.rand(args)
        };
    },
    _defaultActionFor: function(player) {
        var acts = this.actionsFor(player);
        return this._defaultArgForAction(
            acts,
            acts[actions.cancel] ?
                actions.cancel :
                misc.rand(Object.keys(acts))
        );
    },

    actionsFor: function(player) {
        if (player !== this.player) return {};

        return this._actions;
    },

    handleAction: function(player, msg) {
        if (player !== this.player) return;

        var choice = this.choices.find(c => c.is(msg));
        if (!choice) return;

        var arg = choice.args.find(a => c.argFunc(a) === msg.arg);
        if (!arg) return;

        this['handle' + misc.capitalize(choice.action)](player, arg);
    },

    handleDefault: function(player) {
        return this.handleAction(player, this._defaultActionFor(player));
    },

    format: function(player) {
        return misc.merge({
            name: this.name,
            time: this.time,
            event: (this.event && this.event.format) ?
                this.event.format(player) : undefined
        }, (this.format && this.format(player)) || {});
    },

    update: function(delta) {
        this.time -= delta;
        if (this.time <= 0) this.handleDefault();
    }
};

module.exports = Event;