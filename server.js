'use strict';

require('./global');

var log = aReq('server/log'),
    warn = aReq('server/warn'),
    misc = aReq('server/misc'),
    msgs = aReq('shared/messages');

// Setup the server itself
var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.Server(app);

// Setup the static assets and pages
app.use(express.static('public'));
require('fs').readdir('./pages', (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
        var stripped = file.replace('.html', '');
        app.get('/' + (stripped === 'index' ? '' : stripped), (req, res) => {
            res.sendFile(__dirname + '/pages/' + file);
        });
    });
});

// Setup the server sockets functionalities
var io = require('socket.io')(server),

    users = aReq('server/users'),

    login = aReq('server/login')(io, users),
    lobby = aReq('server/lobby')(io, users),
    game = aReq('server/game')(io, users);

login.addHandlers(lobby, game);

// Listen on port
var port = process.env.PORT || 80;
server.listen(port, () => log('Listening on port', port));

// Setup stdin to listen to commands
var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', cmd => {
    cmd = cmd.replace(/\s/g, '');
    if (!cmd.length) return;
    switch(cmd) {
        case 'reload':
            log('Relording...');
            io.emit(msgs.reload, true);
            break;
        case 'exit':
            process.exit();
        default:
            warn('Command unknown', '"' + cmd + '"');
    }
});