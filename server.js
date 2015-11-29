var express = require('express'),
    http = require('http'),
    socketIO = require('socket.io'),
    crypto = require('crypto'),

    log = require('./server/log.js'),
    msgs = require('./shared/messages.js'),
    strings = require('./shared/strings.js'),
    User = require('./server/user.js'),
    users = require('./server/users.js');

var app = express(),
    server = http.Server(app),
    io = socketIO(server),
    hash = crypto.createHash('md5');

app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/pages/index.html');
});

io.on('connection', function(socket) {
    log('Socket connected');
    socket.emit(msgs.auth);
    socket.on(msgs.auth, function(msg) {
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
            socket.emit(msgs.user, { name: user.name, hash: user.hash });
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

server.listen(8080, function() {
    log('Listening on port 8080');
});
