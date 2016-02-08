'use strict';

var misc = aReq('server/misc'),
    Character = aReq('server/game/characters/character'),
    events = aReq('server/game/events');

module.exports = new Character("Sid Ketchum", {
    healCard: { id: 'heal' },
    beforePlay: function(step, onResolved, onSkip) {
        if (step.player.character !== this) return onResolved();
        onResolved(events('cardChoice')(step.player,
            misc.fromArrays(
                step.player.hand.filter(c => c.filter(this)),
                [this.healCard]
            ),
            // onPlay
            card => card === this.healCard ?
                this.handleHeal(step, onResolved, onSkip) :
                card.handlePlay(step, onSkip),
            // onCancel
            () => onSkip()
        ));
    },
    handleHeal: function(step, onResolved, onSkip) {
        let onFinished = onResolved(this.beforePlay(step, onResolved, onSkip));
        onResolved(events('cardChoice')(step.player,
            step.player.hand,
            card1 => onResolved(events('cardChoice')(step.player,
                step.player.hand.filter(c => c !== card1),
                card2 => {
                    step.player.hand.discard(card1.id);
                    step.player.hand.discard(card2.id);
                    step.player.heal(1);
                    onFinished();
                },
                onFinished
            )),
            onFinished
        ));
    }
});