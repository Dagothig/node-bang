'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    Choice = aReq('server/game/events/choice'),
    Character = aReq('server/game/characters/character'),

    events = aReq('server/game/events');

module.exports = new Character("Jesse Jones", {
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();

        let self = this;
        onResolved(events('simple')(
            step.player, actions.draw, ['pile', 'player'],
            function(p, arg) {
                if (arg === 'pile') onResolved();
                else if (arg === 'player')
                    self.handleSteal(step, onResolved, onSkip);
            }
        ));
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