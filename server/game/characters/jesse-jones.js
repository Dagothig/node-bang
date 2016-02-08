'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    Character = aReq('server/game/characters/character'),

    events = aReq('server/game/events');

module.exports = new Character("Jesse Jones", {
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();

        let self = this;
        onResolved({
            actionsFor: function(p) {
                if (p !== step.player) return {};
                let acts = {}
                acts[actions.draw] = ['pile', 'player'];
                return acts;
            },
            handleAction: function(p, msg) {
                if (p !== step.player) return;
                if (msg.action !== actions.draw) return;
                if (msg.arg === 'pile') onResolved();
                else if (msg.arg === 'player')
                    self.handleSteal(step, onResolved, onSkip);
            }
        });
    },
    handleSteal: function(step, onResolved, onSkip) {
        onResolved(events('target')(
            step.player, step.game.players
                .filter(p => p !== step.player && p.alive && p.hand.length),
            target => {
                step.player.hand.push(misc.spliceRand(target.hand));
                step.player.hand.drawFromPile();
                step.game.onGameEvent({
                    name: 'Steal',
                    thief: step.player.name,
                    player: target.name
                });
                onSkip();
            },
            () => this.beforeDraw(step, onResolved, onSkip)
        ));
    }
});