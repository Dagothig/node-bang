'use strict';

var Card = aReq('server/game/cards/card'),
    events = aReq('server/game/events'),
    misc = aReq('server/misc'),
    healing = aReq('server/game/cards/healing'),
    Beer = healing.Beer;

var handleEvent = (eventName, players, recurseArgs, onFollowing, onResolved) => {
    let handlers = [];
    players.forEach(p => handlers.push.apply(handlers, p.handlers(eventName)));

    let handlePile = args => {
        let next = handlers.pop();
        if (next) next[eventName].apply(next, args);
        else if(onFollowing) onFollowing();
        else onResolved();
    }
    recurseArgs.push(event => event ?
        onResolved(event) :
        handlePile(recurseArgs)
    );
    recurseArgs.push(onResolved);
    handlePile(recurseArgs);
};

var handleAfterDeath = (step, killer, player, amount, onResolved) =>
handleEvent('afterDeath',
    step.game.players.filter(p => p.alive || p === player),
    [step, killer, player, amount],
    () => {
        if (player === step.player) step.phase.goToNextTurn(step.game);
        else onResolved();
        step.phase.checkForEnd(step.game);
    },
    onResolved
);
var handleBeforeDeath = (step, killer, player, amount, onResolved) =>
handleEvent('beforeDeath',
    step.game.players.filter(p => p.alive || p === player),
    [step, killer, player, amount],
    () => {
        let discarded = step.phase.cards.discarded;

        discarded.push.apply(discarded, player.hand);
        player.hand.length = 0;

        discarded.push.apply(discarded, player.equipped);
        player.equipped.length = 0;


        step.game.onGameEvent({
            name: 'Dead',
            player: player.name
        });

        handleAfterDeath(step, killer, player, amount, onResolved);
    },
    onResolved
);

var handleDying = (step, killer, player, amount, onResolved) => {
    if (player.alive) {
        handleEvent('afterDamage',
            step.game.players.filter(p => p.alive),
            [step, killer, player, amount],
            undefined, onResolved
        );
        return;
    }

    onResolved(events('cardType', player)(
        player, Beer,
        // When a beer is played, we check if we are dying again
        card => {
            card.handlePlay(step, onResolved);
            handleDying(step, killer, player, onResolved);
        },
        // Player didn't drink beer; they are dead
        () => handleBeforeDeath(step, killer, player, amount, onResolved),
        // Format
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
    if (target.dead) handleDying(step, source, target, amount, onResolved);
    else handleEvent('afterDamage',
        step.game.players.filter(p => p.alive),
        [step, source, target, amount],
        undefined, onResolved
    );
};

var handleAttack = (name, step, card, target, avoidCardType, onResolved) =>
handleEvent('before' + name + 'Response',
    step.game.players.filter(p => p.alive),
    [step, card, target],
    () => onResolved(events('cardType', target)(
        target, avoidCardType,
        // onCard; damage avoided
        card => {
            target.hand.discard(card.id);
            step.game.onGameEvent({
                name: 'Avoid',
                what: name,
                source: step.player.name,
                target: target.name,
                card: card.format()
            });
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
    event: handleEvent,
    beforeDeath: handleBeforeDeath,
    afterDeath: handleAfterDeath,
    dying: handleDying,
    damage: handleDamage,
    attack: handleAttack
};