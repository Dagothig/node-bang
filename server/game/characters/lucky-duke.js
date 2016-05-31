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
                        let unchosen = choices.filter(c => c !== card);
                        cards.discarded.push.apply(cards.discarded, unchosen);
                        step.game.onGameEvent({
                            name: 'discard',
                            from: 'choice',
                            for: 'lucky-duke',
                            cards: unchosen.map(c => c.format())
                        });

                        step.game.onGameEvent({
                            name: 'pile',
                            from: 'choice',
                            for: 'lucky-duke',
                            card: card.format()
                        });

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