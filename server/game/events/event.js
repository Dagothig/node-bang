'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    consts = aReq('server/consts');

function Event(player, choices, formatExtra) {
    this.player = player;
    this.time = consts.eventMaxTime;
    this.lastUpdateTime = this.time;
    this.choices = choices.filter(c => c);
    this._actions = this.choices.reduce((acts, c) => {
        acts[c.action] = c.mapped;
        return acts;
    }, {});
    this.formatExtra = formatExtra;
}
Event.prototype = {
    constructor: Event,
    get name() { return this.constructor.name; },

    _defaultActionFor: function(player) {
        var acts = this.actionsFor(player);
        var action = acts[actions.cancel] ?
            actions.cancel :
            misc.rand(Object.keys(acts));

        var args = acts[action];
        var arg = args && misc.rand(args);
        return {
            action: action,
            arg: arg
        };
    },

    actionsFor: function(player) {
        return player === this.player ? this._actions : {};
    },

    handleAction: function(player, msg) {
        if (player !== this.player) return;

        var choice = this.choices.find(c => c.is(msg));
        if (!choice) return;

        var arg = choice.args.find(a => choice.argFunc(a) === msg.arg);
        if (!arg) return;

        this['handle' + misc.capitalize(choice.action)](player, arg);
    },

    handleDefault: function(player) {
        return this.handleAction(player, this._defaultActionFor(player));
    },

    format: function(player) {
        return misc.merge({
            name: this.name,
            player: this.player.name,
            time: Math.round(this.time * 100) / 100
        }, (this.formatExtra && this.formatExtra(player)) || {});
    },

    update: function(delta) {
        this.time -= delta;
        if (this.time <= 0) {
            this.handleDefault(this.player);
            return true;
        }
        return false;
    }
};

module.exports = Event;