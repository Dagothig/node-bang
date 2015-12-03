var crypto = require('crypto');

function User(name, password) {
    this.sockets = [];
    this.hash = crypto.createHash('md5').update(name.toLowerCase() + ':' + password).digest('hex');
    this.token = crypto.randomBytes(48).toString('hex');
    this.name = name;
    this.joining = false;
    this.disconnectTimout = null;
}

User.prototype = Object.create({
    get isConnected() {
        return !!this.sockets.length;
    },
    addSocket: function addSocket(socket) {
        // Add the socket if its not already listed
        if (this.sockets.indexOf(socket) === -1) this.sockets.push(socket);
        // Clear the timeout
        if (this.disconnectTimout) {
            clearTimeout(this.disconnectTimout);
            this.disconnectTimout = null;
        }
    },
    emit: function emit() {
        this.sockets.forEach((socket) => socket.emit.apply(socket, arguments));
    }
});

module.exports = User;
