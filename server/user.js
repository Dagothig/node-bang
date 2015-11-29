var crypto = require('crypto');

function User(name, password) {
    this.sockets = [];
    this.hash = crypto.createHash('md5').update(name.toLowerCase() + ':' + password).digest('hex');
    this.token = crypto.randomBytes(48).toString('hex');
    this.name = name;
}

User.prototype = Object.create({
    get isConnected() {
        return !!this.sockets.length;
    }
});

module.exports = User;
