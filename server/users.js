var misc = aReq('server/misc');

module.exports = misc.merge([], {
    findForSocket: function(socket) {
        return this.find((user, i) => user.sockets.indexOf(socket) !== -1);
    },
    findForName: function(name) {
        return this.find((user, i) => user.name.toLowerCase() === name.toLowerCase());
    },
    remove: function(user) {
        this.splice(this.indexOf(user), 1);
    }
});
