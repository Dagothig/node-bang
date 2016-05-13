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
                Array.prototype.push.apply(step.player.hand, cards);
                step.game.onGameEvent({
                    name: 'draw',
                    from: 'pile',
                    player: step.player.name,
                    amount: 3
                });
                onResolved(events('cardChoice')(
                    step.player, cards,
                    card => {
                        misc.remove(step.player.hand, card);
                        step.phase.cards.push(card);
                        // TODO; don't tell what the card is
                        step.game.onGameEvent({
                            name: 'pile',
                            from: 'hand',
                            player: step.player.name,
                            card: card.format()
                        });
                        onSkip();
                    }
                ))
            }
        ));
    }
});