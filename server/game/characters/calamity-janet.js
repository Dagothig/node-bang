'use strict';

var Character = aReq('server/game/characters/character'),

    events = aReq('server/game/events'),

    attacking = aReq('server/game/cards/attacking'),
    Bang = attacking.Bang,
    Mancato = attacking.Mancato;

module.exports = new Character("Calamity Janet", {
    cardType: function(player, cardType, onChoice, onCancel, format) {
        return events('cardTypes')(
            player,
            (player.character === this
                && (cardType === Mancato || cardType === Bang)
            ) ? [Bang, Mancato] : [cardType],
            onChoice, onCancel, format
        );
    },
    beforePlay: function(step, onResolved, onSkip) {
        if (step.player.character !== this) onResolved();
        else onResolved(events('cardChoice')(step.player,
            step.player.hand.filter(card => (card instanceof Mancato) ?
                Bang.prototype.filter.call(card, step) :
                card.filter(step)
            ),
            // onPlay
            card => (card instanceof Mancato) ?
                Bang.prototype.handlePlay.call(card, step, onSkip) :
                card.handlePlay(step, onSkip),
            // onCancel
            () => step.finalize()
        ));
    }
});