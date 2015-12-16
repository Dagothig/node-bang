var Role = aReq('server/game/role');

var roles = {
    sheriff: new Role("Sheriff", "Sheriff", 1),
    deputy: new Role("Deputy", "Unknown", 0),
    outlaw: new Role("Outlaw", "Unknown", 0),
    renegade: new Role("Renegade", "Unknown", 0)
};

module.exports = roles;
