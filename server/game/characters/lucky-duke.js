'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    events = aReq('server/game/events');

module.exports = new Character("Lucky Duke", {
    cardDraw: function(player, cards, onDraw, onCancel, format, step) {
        if (player.character !== this)
            return events('cardDraw')(player, cards, onDraw, onCancel, format);

        return events('delegate')(onResolved => events('cardsDraw')(
            player, cards, 2,
            choices => {
                step.game.onGameEvent({
                    name: 'choice',
                    for: 'lucky-duke',
                    cards: choices.map(c => c.format())
                });
                onResolved(events('cardChoice')(
                    player, choices,
                    // onChoice
                    card => {
                        step.game.onGameEvent({
                            name: 'discard',
                            from: 'choice',
                            for: 'lucky-duke',
                            result: card.format(),
                            cards: choices.map(c => c.format())
                        })
                        misc.remove(choices, card);
                        cards.discarded.push.apply(cards.discarded, choices);
                        onDraw(card);
                    },
                    // onCancel
                    undefined,
                    // format
                    () => ({
                        what: 'choice',
                        for: 'lucky-duke',
                        cards: choices.map(c => c.format())
                    })
                ))
            },
            onCancel, format
        ));
    }
});