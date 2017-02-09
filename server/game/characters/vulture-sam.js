'use strict';

var Character = aReq('server/game/characters/character'),
    handles = aReq('server/game/handles');

module.exports = new Character("Vulture Sam", {
    beforeDeath: function(step, killer, player, amount, onResolved, onSkip) {
        // If vulture sam is actually the one dying, then his power can't trigger
        if (player.character === this) return onResolved();

        let sam = step.game.players.find(p => p.character === this);

        sam.hand.add(player.hand,
            { from: 'hand', target: player.name },
            p => p === sam || p === player
        );
        player.hand.length = 0;

        sam.hand.add(player.equipped,
            { from: 'equipped', target: player.name },
            true
        );
        player.equipped.length = 0;

        // Since the players hand will be empty afterwards anyway, we might as well
        // just continue as usual
        onResolved();
    }
});