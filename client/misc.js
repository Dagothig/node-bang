module.exports = {
    isCurrent: function isCurrent(current, user) {
        return current &&
            user.name.toLowerCase() === current.name.toLowerCase();
    }
};
