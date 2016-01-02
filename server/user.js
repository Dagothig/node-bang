var crypto = require('crypto'),
    log = aReq('server/log'),
    warn = aReq('server/warn'),
    consts = aReq('shared/consts');

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
        else warn('Attempting to add used socket to ', this.name);
        log(this.name, 'at', this.sockets.length, 'socket(s)');
        // Clear the timeout
        if (this.disconnectTimout) {
            clearTimeout(this.disconnectTimout);
            this.disconnectTimout = null;
        }
    },
    removeSocket: function removeSocket(socket, disconnectCallback) {
        var index = this.sockets.indexOf(socket);
        if (index >= 0) this.sockets.splice(index, 1);
        else warn('Attempting to remove non-present socket from', this.name);
        log(this.name ,'at', this.sockets.length, 'socket(s)');

        if (this.sockets.length) return;
        this.disconnectTimout = setTimeout(() => {
            disconnectCallback();
        }, consts.disconnectTimeout);
    },
    emit: function emit() {
        this.sockets.forEach((socket) => socket.emit.apply(socket, arguments));
    }
});

module.exports = User;
