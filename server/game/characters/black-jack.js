'use strict';

var Character = aReq('server/game/characters/character'),
    actions = aReq('server/actions'),
    events = aReq('server/game/events'),
    Card = aReq('server/game/cards/card'),
    suits = Card.suits;

module.exports = new Character("Black Jack", {
    priority: -1,
    beforeDraw: function(step, onResolved, onSkip) {
        if (step.player.character !== this) onResolved();
        else onResolved(events('simple')(
            step.player, actions.draw, ['pile'],
            () => this.handleDraw(step, onResolved, onSkip),
            () => ({ name: 'CardsDrawEvent', for: 'Black Jack' })
        ));
    },
    handleDraw: function(step, onResolved, onSkip) {
        step.player.hand.drawFromPile();
        let shown = step.phase.cards.draw();
        step.game.onGameEvent({
            name: 'choice',
            for: 'black-jack',
            cards: shown.map(c => c.format())
        });
        onResolved(events('timed')(3, () => {
            let second = shown[0];
            step.player.hand.add(second,
                { from: 'choice', for: 'black-jack' }, true);
            if (second.suit === suits.hearts || second.suit === suits.diamonds)
                step.player.hand.drawFromPile();
            onSkip();
        }, () => ({
            name: 'CardsDrawEvent',
            what: 'choice',
            for: 'Black Jack',
            player: step.player.name,
            cards: shown
        })));
    }
});