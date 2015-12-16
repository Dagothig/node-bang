var misc = require ('../shared/misc');

function areTheSame(user1, user2) {
    return user1.name.toLowerCase() === user2.name.toLowerCase();
}
function isCurrent(current, user) {
    return current && areTheSame(current, user);
}

module.exports = misc.define(misc, {
    areTheSame: areTheSame,
    isCurrent: isCurrent
});
