'use strict';

var Character = aReq('server/game/characters/character'),

    events = aReq('server/game/events'),
    handles = aReq('server/game/cards/handles'),

    attacking = aReq('server/game/cards/attacking'),
    Bang = attacking.Bang,
    Mancato = attacking.Mancato;

module.exports = new Character("Slab the Killer", {
    beforeBangResponse: function(step, card, target, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();
        if (!(card instanceof Bang)) return onResolved();

        let onCancel = () =>
            handles.damage(step, step.player, target, 1, onSkip);

        let format = () => ({
            name: 'Bang',
            source: step.player.name,
            target: target.name,
            card: card.format()
        });

        onResolved(events('cardType', target)(
            target, Mancato,
            // onCard; we ask for another Mancato that isn't the first one
            card1 => onResolved(events('cardType', target)(
                target, Mancato,
                card2 => {
                    target.hand.discard(card1.id);
                    target.hand.discard(card2.id);
                    step.game.onGameEvent({
                        name: 'Avoid',
                        what: name,
                        source: step.player.name,
                        target: target.name,
                        cards: [card1.format(), card2.format()]
                    });
                    onSkip();
                },
                onCancel, format
            ).filterCards(c => c !== card1)),
            onCancel, format
        ));
    }
});