'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    events = aReq('server/game/events');

module.exports = new Character("Lucky Duke", {
    cardDraw: function(player, cards, onDraw, onCancel, format) {
        if (player.character !== this)
            return events('cardDraw')(player, cards, onDraw, onCancel, format);

        return events('delegate')(onResolved => events('cardsDraw')(
            player, cards, 2,
            choices => onResolved(events('cardChoice')(
                player, choices,
                card => {
                    misc.remove(choices, card);
                    cards.discarded.push.apply(cards.discarded, choices);
                    onDraw(card);
                },
                undefined, format
            )),
            onCancel, format
        ));
    }
});