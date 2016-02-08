'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    events = aReq('server/game/events');

module.exports = new Character("Kit Carlson", {
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();

        onResolved(events('cardsDraw')(
            step.player, step.phase.cards, 3,
            cards => onResolved(events('cardChoice')(
                step.player, cards,
                card => {
                    misc.remove(cards, card);
                    step.phase.cards.push(card);
                    onSkip();
                },
                undefined
            ))
        ));
    }
});