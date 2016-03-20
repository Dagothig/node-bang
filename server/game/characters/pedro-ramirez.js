'use strict';

var actions = aReq('server/actions'),
    Character = aReq('server/game/characters/character');

module.exports = new Character("Pedro Ramirez", {
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();
        if (!step.phase.cards.discarded.length) return onResolved();

        let self = this;
        onResolved(events('simple')(
            step.player, actions.draw, ['pile', 'discarded'],
            function(p, arg) {
                if (arg === 'pile') onResolved();
                else if (arg === 'discarded')
                    self.handleDrawDiscard(step, onResolved, onSkip);
            }
        ));
    },
    handleDrawDiscard: function(step, onResolved, onSkip) {
        step.player.hand.drawFromPile();
        let card = step.phase.cards.discarded.pop();
        step.player.hand.push(card);
        step.game.onGameEvent({
            name: 'Draw',
            player: step.player.name,
            card: card.format()
        });
        onSkip();
    }
});