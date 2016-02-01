var log = aReq('server/log'),
    warn = aReq('server/warn'),
    msgs = aReq('shared/messages'),
    strings = aReq('shared/strings'),
    consts = aReq('shared/consts'),
    validator = require('validator'),
    User = aReq('server/user'),

    listeners = [];

function handleAuth(io, users, socket, msg) {
    msg.name = validator.escape(msg.name).replace(/[\s]/g, '');
    if (!msg.name || !msg.name.length) {
        socket.emit(msgs.auth, { reason: strings.authValidation });
        return;
    }

    var user;
    if (msg.token) {
        var existing = users.findForName(msg.name);
        var isExisting = existing && existing.token === msg.token;
        if (existing && existing.token === msg.token) {
            user = existing;
        } else {
            socket.emit(msgs.user, null);
            return;
        }
    }

    if (!msg.password || msg.password.length < consts.minPasswordLength) {
        socket.emit(msgs.auth, { reason: strings.authValidation });
        return;
    }

    if (!user) {
        var existing = users.findForName(msg.name);
        user = new User(msg.name, msg.password);
        if (existing) {
            if (user.hash === existing.hash) {
                user = existing;
            } else {
                socket.emit(msgs.auth, { reason: strings.authNameTaken });
                return;
            }
        } else {
            log(user.name, 'connected');
            users.push(user);
        }
    }

    user.addSocket(socket);
    listeners.forEach(listener => listener.onConnected(user, socket));

    socket.emit(msgs.user, {
        name: user.name,
        token: user.token
    });
}

function handleDisconnect(io, users, socket) {
    log('Socket disconnected');

    var user = users.findForSocket(socket);
    if (!user) return;

    user.removeSocket(socket, () => {
        log(user.name, 'disconnected');
        users.remove(user);
        listeners.forEach(l => l.onDisconnected(user, socket));
    });
}

module.exports = (io, users) => {
    io.on('connection', socket => {
        log('Socket connected');

        socket.on(msgs.auth, msg => handleAuth(io, users, socket, msg));
        socket.on('disconnect', () => handleDisconnect(io, users, socket));
        socket.on('error', err => { throw err; });

        socket.emit(msgs.auth);
    });

    return {
        addHandlers: function() {
            listeners.push.apply(listeners, arguments);
        }
    };
};