'use strict';

var Character = aReq('server/game/characters/character'),
    handles = aReq('server/game/handles');

module.exports = new Character("Vulture Sam", {
    beforeDeath: function(step, killer, player, amount, onResolved, onSkip) {
        // If vulture sam is actually the one dying, then his power can't trigger
        if (player.character === this) return onResolved();

        let sam = step.game.players.find(p => p.character === this);

        sam.hand.push.apply(sam.hand, player.hand);
        player.hand.length = 0;

        sam.hand.push.apply(sam.hand, player.equipped);
        player.equipped.length = 0;

        handles.afterDeath(step, killer, player, amount, onSkip);
    }
});