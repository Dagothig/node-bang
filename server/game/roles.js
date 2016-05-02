var Role = aReq('server/game/role');

var roles;
roles = {
    sheriff: new Role("Sheriff", "Sheriff", {
        lifeModifier: 1,
        initCardsModifier: 1,
        afterDeath: function(step, killer, player, amount, onResolved, onSkip) {
            if (player && player.role === this &&
                killer && killer.role === roles.deputy) {
                killer.hand.discard();
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
