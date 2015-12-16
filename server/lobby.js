var log = aReq('server/log'),
    msgs = aReq('shared/messages'),
    strings = aReq('shared/strings');

var io, users;

function formattedUsers() {
    return users.map((user) => {
        return {
            name: user.name
        }
    });
}

module.exports = {
    setup: function setupLobby() {
        io = arguments[0];
        users = arguments[1];
        arguments[2].listen(this);
    },
    onConnected: function onConnected(user, socket) {
        socket.on(msgs.message, function(msg) {
            // Sanitize message
            if (msg && msg.message) {
                msg.message = msg.message.trim();
                msg.message = msg.message.replace(/</g, '&lt;');
                msg.message = msg.message.replace(/>/g, '&gt;');
            }
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
    },
    onDisconnected: function onDisconnected(user, socket) {
        io.emit(msgs.users, formattedUsers());
    }
}
