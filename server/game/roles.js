var Role = aReq('server/game/role'),
    events = aReq('server/game/events');

var roles;
roles = {
    sheriff: new Role("Sheriff", "Sheriff", {
        lifeModifier: 1,
        initCardsModifier: 1,
        afterDeath: function(step, killer, player, amount, onResolved, onSkip) {
            if (!killer || !player || killer === player) return onResolved();

            if (killer.role === this && player.role === roles.deputy) {
                killer.hand.discard();
            }
            if (player.role === roles.outlaw) {
                killer.hand.drawFromPile(3);
            }
            onResolved();
        }
    }),
    deputy: new Role("Deputy", "Unknown", {}),
    outlaw: new Role("Outlaw", "Unknown", {}),
    renegade: new Role("Renegade", "Unknown", {})
};
Object.keys(roles).forEach(key => roles[key].key = key);

module.exports = roles;
