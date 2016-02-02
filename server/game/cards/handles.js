var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

var handleDeath = (step, killer, player, amount, onResolved) => {
    if (player.alive) {
        target.handleEvent('afterDamage',
            [step, killer, player, amount],
            undefined, onResolved
        );
        return;
    }

    onResolved(events.cardTypeEvent(
        player, Beer,
        card => {
            card.handlePlay(step, onResolved);
            handleDeath(step, killer, player, onResolved);
        },
        () => {
            if (player === step.player) step.phase.goToNextTurn(step.game);
            else onResolved();
            step.phase.checkForEnd(step.game);
        },
        () => ({
            name: 'Dying',
            player: player.name,
            killer: killer ? killer.name : undefined
        })
    ));
};
var handleDamage = (step, source, target, amount, onResolved) => {
    target.life -= amount;
    step.game.onGameEvent({
        name: 'Damage',
        source: source ? source.name : undefined,
        target: target.name,
        amount: amount
    });
    if (target.dead) handleDeath(step, source, target, amount, onResolved);
    else target.handleEvent(
        'afterDamage', [step, source, target, amount],
        undefined, onResolved
    );
};

var handleAttack = (name, step, card, target, avoidCardType, onResolved) =>
target.handleEvent(
    'before' + name + 'Response', [step, card, target],
    () => onResolved(events.cardTypeEvent(
        target, avoidCardType,
        // onCard; damage avoided
        card => {
            step.game.onGameEvent({
                name: 'Avoid',
                what: name,
                source: step.player.name,
                target: target.name,
                card: card.format()
            });
            target.hand.discard(card.id);
            onResolved();
        },
        // onCancel; damage goes through
        () => handleDamage(step, step.player, target, 1, onResolved),
        () => ({
            name: name,
            source: step.player.name,
            target: target.name,
            card: card.format()
        })
    )),
    onResolved
);

module.exports = {
    death: handleDeath,
    damage: handleDamage,
    attack: handleAttack
};