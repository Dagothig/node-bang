var Role = require('./role.js');

var roles = {
    sheriff: new Role("Sheriff"),
    deputy: new Role("Deputy"),
    outlaw: new Role("Outlaw"),
    renegade: new Role("Renegade")
};

module.exports = roles;
