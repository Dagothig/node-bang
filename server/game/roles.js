var Role = require('./role.js');

var roles = {
    sheriff: new Role("Sheriff", "Sheriff"),
    deputy: new Role("Deputy", "Unknown"),
    outlaw: new Role("Outlaw", "Unknown"),
    renegade: new Role("Renegade", "Unknown")
};

module.exports = roles;
