'use strict';

var actions = aReq('server/actions'),
    Character = aReq('server/game/characters/character');

module.exports = new Character("Pedro Ramirez", {
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();
        if (!step.phase.cards.discarded.length) return onResolved();

        let self = this;
        onResolved({
            actionsFor: function(p) {
                if (p !== step.player) return {};
                let acts = {};
                acts[actions.draw] = ['pile', 'discarded'];
                return acts;
            },
            handleAction: function(p, msg) {
                if (p !== step.player) return;
                if (msg.action !== actions.draw) return;
                if (msg.arg === 'pile') onResolved();
                else if (msg.arg === 'discarded')
                    self.handleDrawDiscard(step, onResolved, onSkip);
            }
        });
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