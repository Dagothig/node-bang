var log = require('./log.js'),
    msgs = require('../shared/messages.js'),
    strings = require('../shared/strings.js');

var io, users;

function onUser(user, socket) {
    socket.on(msgs.message, function(msg) {
        if (user.token !== msg.token || !msg.message || !msg.message.length) return;
        log(user.name, "sent", msg.message);
        io.emit(msgs.message, {
            name: user.name,
            message: msg.message
        })
    });
    socket.on(msgs.users, function(msg) {
        socket.emit(msgs.users, formattedUsers());
    });
    io.emit(msgs.users, formattedUsers());
}
function formattedUsers() {
    var formatted = [];
    users.forEach((user) => formatted.push({
        name : user.name
    }));
    return formatted;
}

module.exports = {
    setup: function setupLobby() {
        io = arguments[0];
        users = arguments[1];
        arguments[2].onUser(this);
    },
    onUser: onUser
}
