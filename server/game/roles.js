var Role = aReq('server/game/role');

var roles = {
    sheriff: new Role("Sheriff", "Sheriff", {
        lifeModifier: 1,
        initCardsModifier: 1
    }),
    deputy: new Role("Deputy", "Unknown", {}),
    outlaw: new Role("Outlaw", "Unknown", {}),
    renegade: new Role("Renegade", "Unknown", {})
};
Object.keys(roles).forEach(key => roles[key].key = key);

module.exports = roles;
