var Role = aReq('server/game/role'),
    events = aReq('server/game/events');

var roles;
roles = {
    sheriff: new Role("Sheriff", "Sheriff", {
        lifeModifier: 1,
        initCardsModifier: 1,
        afterDeath: function(step, killer, player, amount, onResolved, onSkip) {
            if (killer && killer.role === this &&
                player && player.role === roles.deputy) {
                killer.hand.discard();
            }
            onResolved();
        }
    }),
    deputy: new Role("Deputy", "Unknown", {}),
    outlaw: new Role("Outlaw", "Unknown", {
        afterDeath: function(step, killer, player, amount, onResolved, onSkip) {
            if (killer && player && player.role === this) {
                killer.hand.drawFromPile(3);
            }
            onResolved();
        }
    }),
    renegade: new Role("Renegade", "Unknown", {})
};
Object.keys(roles).forEach(key => roles[key].key = key);

module.exports = roles;
