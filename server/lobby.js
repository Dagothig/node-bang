var log = aReq('server/log'),
    msgs = aReq('shared/messages'),
    validator = require('validator');

var formatted = users => users.map(user => ({
    name: user.name
}));

function handleMsg(io, users, user, socket, msg) {
    if (!msg || user.token !== msg.token) return;
    msg.message = validator.trim(msg.message);
    if (!msg.message) return;
    log(user.name, "sent", msg.message);
    users.emit(msgs.message, {
        name: user.name,
        message: msg.message
    });
}

function handleImg(io, users, user, socket, msg) {
    if (!msg || user.token !== msg.token) return;
    log(user.name, 'sent image');
    if (msg.data.length > 480 * 480 * 24)
        return socket.error('The image sent was too large');
    users.emit(msgs.image, {
        name: user.name,
        data: msg.data
    });
}

function handleUsers(io, users, user, socket) {
    socket.emit(msgs.users, formatted(users));
}

module.exports = (io, users) => ({
    onConnected: (user, socket) => {
        socket.on(msgs.message, msg => handleMsg(io, users, user, socket, msg));
        socket.on(msgs.image, msg => handleImg(io, users, user, socket, msg));
        socket.on(msgs.users, () => handleUsers(io, users, user, socket));
        users.emit(msgs.users, formatted(users));
    },
    onDisconnected: (user, socket) => {
        users.emit(msgs.users, formatted(users));
    }
});