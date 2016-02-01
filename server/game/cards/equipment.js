var Card = aReq('server/game/cards/card'),
    misc = aReq('server/misc');

function Equipment(name, suit, rank, slot) {
    Card.call(this, name, suit, rank, Card.types.blue);
    this.slot = slot;
}
misc.extend(Card, Equipment, {
    format: function() {
        var formatted = misc.merge(Card.prototype.format.apply(this, arguments), {
            slot: this.slot
        });
        Object.keys(this)
            .filter(k => k.endsWith('Modifier'))
            .forEach(k => formatted[k] = this[k]);
        return formatted;
    },
    handlePlay: function(step, onResolved) {
        onResolved(this.getTarget(
            step.player, step.game.players,
            // onTarget; applying equipment
            target => {
                step.player.hand.remove(this.id);
                var current = target.equipped.find(c => c.slot === this.slot);
                if (current) target.equipped.discard(current.id);
                target.equipped.push(this);
                onResolved();
            },
            () => onResolved()
        ));
    }
});

module.exports = Equipment;