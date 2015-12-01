var misc = require ('../shared/misc.js');

function isCurrent(current, user) {
    return current &&
        user.name.toLowerCase() === current.name.toLowerCase();
}

misc.isCurrent = isCurrent;

module.exports = misc;
