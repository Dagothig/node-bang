'use strict';

var misc = aReq('server/misc'),
    actions = aReq('server/actions'),
    Choice = aReq('server/game/events/choice'),
    Character = aReq('server/game/characters/character'),

    events = aReq('server/game/events');

module.exports = new Character("Jesse Jones", {
    priority: -1,
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();

        let filter = p => p.alive && p !== step.player && p.hand.length;
        onResolved(misc.merge(events('event')(
            step.player,
            [ // Choices
                new Choice(actions.draw, ['pile']),
                new Choice(
                    actions.target,
                    step.game.players.filter(filter),
                    t => t.name
                )
            ],
            // format
            () => ({
                name: 'CardsDrawEvent',
                for: 'Jesse Jones'
            })
        ), {
            handleDraw: function(player) {
                player.hand.drawFromPile(2);
                onSkip();
            },
            handleTarget: function(player, target) {
                let card = misc.spliceRand(target.hand);
                player.hand.push(card);
                player.hand.drawFromPile();
                let specific = {
                    name: 'draw',
                    from: 'hand',
                    player: step.player.name,
                    target: target.name,
                    card: card.format()
                };
                let unspecific = {
                    name: 'draw',
                    from: 'hand',
                    player: step.player.name,
                    target: target.name,
                    amount: 1
                };
                step.game.onGameEvent(p =>
                    (p === step.player || p === target) ? specific : unspecific
                );
                onSkip();
            }
        }));
    }
});