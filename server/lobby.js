var log = aReq('server/log'),
    msgs = aReq('shared/messages'),
    validator = require('validator');

var formatted = users => users.map(user => ({
    name: user.name
}));

function handleMsg(io, users, user, socket, msg) {
    if (!msg || user.token !== msg.token) return;
    msg.message = validator.trim(validator.escape(msg.message));
    if (!msg.message) return;
    log(user.name, "sent", msg.message);
    io.emit(msgs.message, {
        name: user.name,
        message: msg.message
    });
}

function handleUsers(io, users, user, socket) {
    socket.emit(msgs.users, formatted(users));
}

module.exports = (io, users) => ({
    onConnected: (user, socket) => {
        socket.on(msgs.message, msg => handleMsg(io, users, user, socket, msg));
        socket.on(msgs.users, () => handleUsers(io, users, user, socket));
        io.emit(msgs.users, formatted(users));
    },
    onDisconnected: (user, socket) => {
        io.emit(msgs.users, formatted(users));
    }
});