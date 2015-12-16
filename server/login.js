var log = aReq('server/log'),
    msgs = aReq('shared/messages'),
    strings = aReq('shared/strings'),
    User = aReq('server/user');

var listeners = [],
    disconnectTimout = 5000;

module.exports = {
    setup: function setupLogin(io, users, lobby) {
        io.on('connection', function(socket) {
            log('Socket connected');
            socket.emit(msgs.auth);
            socket.on(msgs.auth, function(msg) {
                if (msg && msg.name) msg.name = msg.name.trim();
                var existing = msg && msg.name ? users.findForName(msg.name) : null;
                // We support reconnection through re-sending the user's token
                if (msg.token) {
                    if (existing && existing.token === msg.token) socket.emit(msgs.user, existing);
                    else socket.emit(msgs.user, null);
                }
                // If the connection arguments are valid, then we'll go through
                else if (msg.name && msg.password && msg.password.length >= 4) {
                    var user = new User(msg.name, msg.password);
                    // If a corresponding user already exists, then we need to check if they
                    // connected with the same info; otherwise, we give priority to the existing
                    // user
                    if (existing) {
                        if (user.hash === existing.hash) user = existing;
                        else {
                            socket.emit(msgs.auth, { reason: strings.authNameTaken });
                            return;
                        }
                    }
                    // Otherwise, then we have a new user on our hands
                    else {
                        log(user.name, 'connected');
                        users.push(user);
                    }

                    user.addSocket(socket);
                    listeners.forEach((listener) => listener.onConnected(user, socket));

                    // Alert the user with their info
                    socket.emit(msgs.user, {
                        name: user.name,
                        token: user.token
                    });
                    log(msg.name, 'at', user.sockets.length, 'socket(s)');
                }
                // Alert the user that the authentication failed
                else {
                    socket.emit(msgs.auth, { reason: strings.authValidation });
                    return;
                }
            });

            socket.on('disconnect', function(msg) {
                log('Socket disconnected');

                // Check if the socket had a user associated with it
                var existing = users.findForSocket(socket);
                if (existing) {
                    // Remove the socket from the user's list of sockets
                    var sockets = existing.sockets;
                    sockets.splice(sockets.indexOf(socket), 1);

                    // If the user no longer has any socket associated with it,
                    // start a timeout to disconnect them
                    if (!sockets.length) {
                        existing.disconnectTimout = setTimeout(function () {
                            log(existing.name, 'disconnected');
                            existing.disconnectTimout = null;
                            users.remove(existing);
                            listeners.forEach((listener) => listener.onDisconnected(existing, socket));
                        }, disconnectTimout);
                    }

                    log(existing.name ,'at', sockets.length, 'socket(s)');
                }
            });
        });
    },
    listen: function listen(listener) {
        listeners.push(listener);
    }
};
