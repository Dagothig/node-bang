'use strict';

var Character = aReq('server/game/characters/character'),
    handles = aReq('server/game/handles');

module.exports = new Character("Vulture Sam", {
    beforeDeath: function(step, killer, player, amount, onResolved, onSkip) {
        // If vulture sam is actually the one dying, then his power can't trigger
        if (player.character === this) return onResolved();

        let sam = step.game.players.find(p => p.character === this);

        let specific = {
            name: 'draw',
            from: 'hand',
            player: sam.name,
            target: player.name,
            cards: player.hand.map(c => c.format())
        };
        let unspecific = {
            name: 'draw',
            from: 'hand',
            player: sam.name,
            target: player.name,
            amount: player.hand.length
        };
        step.game.onGameEvent(p =>
            (p === sam || p === player) ? specific : unspecific
        );
        sam.hand.push.apply(sam.hand, player.hand);
        player.hand.length = 0;

        step.game.onGameEvent({
            name: 'draw',
            from: 'equipped',
            player: sam.name,
            target: player.name,
            cards: player.equipped.map(c => c.format())
        });
        sam.hand.push.apply(sam.hand, player.equipped);
        player.equipped.length = 0;

        // Since the players hand will be empty afterwards anyway, we might as well
        // just continue as usual
        onResolved();
    }
});