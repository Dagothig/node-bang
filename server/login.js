var log = require('./log.js'),
    msgs = require('../shared/messages.js'),
    strings = require('../shared/strings.js'),
    User = require('./user.js');

var listeners = [];

module.exports = {
    setup: function setupLogin(io, users, lobby) {
        io.on('connection', function(socket) {
            log('Socket connected');
            socket.emit(msgs.auth);
            socket.on(msgs.auth, function(msg) {
                console.log(msg);
                if (msg.name && msg.password && msg.password.length >= 6) {
                    var user = new User(msg.name, msg.password);
                    var existing = users.findForName(user.name);
                    if (existing) {
                        if (user.hash === existing.hash) user = existing;
                        else {
                            socket.emit(msgs.auth, { reason: strings.authNameTaken });
                            return;
                        }
                    } else users.push(user);
                    if (user.sockets.indexOf(socket) === -1) user.sockets.push(socket);
                    listeners.forEach((listener) => listener.onUser(user, socket));
                    socket.emit(msgs.user, {
                        name: user.name,
                        token: user.token
                    });
                    log('User', msg.name, 'at', user.sockets.length, 'socket(s)');
                } else {
                    socket.emit(msgs.auth, { reason: strings.authValidation });
                    return;
                }
            })
            socket.on('disconnect', function(msg) {
                log('Socket disconnected');
                var existing = users.findForSocket(socket);
                if (existing) {
                    var sockets = existing.sockets;
                    sockets.splice(sockets.indexOf(socket), 1);
                    if (!sockets.length) users.remove(existing);
                    log('User', existing.name ,'at', sockets.length, 'socket(s)');
                }
            });
        });
    },
    onUser: function onSocket(listener) {
        listeners.push(listener);
    }
};
