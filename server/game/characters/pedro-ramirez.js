'use strict';

var actions = aReq('server/actions'),
    Character = aReq('server/game/characters/character'),
    events = aReq('server/game/events'),
    log = aReq('server/log'),
    warn = aReq('server/warn');

module.exports = new Character("Pedro Ramirez", {
    priority: -1,
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();
        if (!step.phase.cards.discarded.length) return onResolved();

        let self = this;
        onResolved(events('simple')(
            step.player, actions.draw, ['pile', 'discard'],
            function(p, arg) {
                if (arg === 'pile') step.player.hand.drawFromPile();
                else if (arg === 'discard')
                    step.player.hand.add(
                        step.phase.cards.discarded.pop(),
                        { from: 'discard' }, true);
                step.player.hand.drawFromPile();
                onSkip();
            },
            // format
            () => ({
                name: 'CardsDrawEvent',
                for: 'Pedro Ramirez'
            })
        ));
    }
});