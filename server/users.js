var users = [];
users.findForSocket = function findForSocket(socket) {
    return this.find((user, i) => user.sockets.indexOf(socket) !== -1);
};
users.findForHash = function findForHash(hash) {
    return this.find((user, i) => user.hash === hash);
};
users.findForName = function findForName(name) {
    return this.find((user, i) => user.name.toLowerCase() === name.toLowerCase());
};
users.remove = function remove(user) {
    this.splice(this.indexOf(user), 1);
};

module.exports = users;
