'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    events = aReq('server/game/events');

module.exports = new Character("Kit Carlson", {
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();

        onResolved(events('cardsDraw')(
            step.player, step.phase.cards, 3,
            cards => {
                step.player.hand.add(cards, { from: 'pile' });
                onResolved(events('cardChoice')(
                    step.player, cards,
                    card => {
                        misc.remove(step.player.hand, card);
                        step.phase.cards.push(card);
                        let spec = {
                            name: 'pile',
                            from: 'hand',
                            player: step.player.name,
                            card: card.format()
                        };
                        let unspec = {
                            name: 'pile',
                            from: 'hand',
                            player: step.player.name,
                            amount: 1
                        };
                        step.game.onGameEvent(p =>
                            p === step.player ? spec : unspec
                        );
                        onSkip();
                    },
                    // onCancel
                    undefined,
                    // format
                    () => ({
                        for: 'Kit-Carlson'
                    })
                ))
            }
        ));
    }
});