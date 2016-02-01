var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc');

var handleDeath = (step, killer, player, onResolved) => {
    onResolved(player.alive ? undefined : events.CardTypeEvent(
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
    if (target.dead) handleDeath(step, source, target, onResolved);
    else onResolved();
};

var handleAttack = (name, step, card, target, avoidCardType, onResolved) =>
target.handleEvent(
    'before' + name + 'Response', [step, card, target],
    () => onResolved(events.CardTypeEvent(
        target, avoidCardType,
        // onCard; damage avoided
        card => {
            step.game.onGameEvent({
                name: 'Avoid',
                what: name,
                source: step.player.name,
                target: target.name,
                card: card.id
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
            card: card.id
        })
    )),
    onResolved
);
var handleBang = (step, card, target, onResolved) =>
    handleAttack('Bang', step, card, target, Mancato, onResolved);
var handleIndians = (step, card, target, onResolved) =>
    handleAttack('Indians', step, card, target, Bang, onResolved);

module.exports = {
    death: handleDeath,
    damage: handleDamage,
    attack: handleAttack,
    bang: handleBang,
    indians: handleIndians
};