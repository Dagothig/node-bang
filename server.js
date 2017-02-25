'use strict';

require('./global');

var log = aReq('server/log'),
    warn = aReq('server/warn'),
    misc = aReq('server/misc'),
    msgs = aReq('shared/messages'),
    consts = aReq('server/consts'),
    strs = aReq('shared/strings');

if (process.argv.find(a => a === '--help')) {
    console.log('Overrideable constants:');
    Object.entries(consts)
        .map(c => [misc.spacize(c[0]).toLowerCase().replace(/\ /g, '-'), c[1]])
        .forEach(c => console.log('  --' + c[0] + ' =', c[1]));
    return;
}

misc.parseArgs(process.argv, consts, log, warn);

// Setup the server itself
var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.Server(app);

// Setup the static assets and pages
app.use(express.static(__dirname + '/public'));
require('fs').readdir(__dirname + '/pages', (err, files) => {
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

io.use((socket, next) => {
    if (socket.allowance)
        throw new Error('socket.allowance already defined!');
    socket.allowance = consts.socketAllowance;
    socket.use((ev, next) => {
        let now = new Date().getTime();

        socket.allowance--;
        if (socket.lastAccess)
            socket.allowance = Math.min(
                consts.socketAllowance,
                socket.allowance +
                    (now - socket.lastAccess) * consts.socketRate / 1000
            );
        socket.lastAccess = now;
        if (socket.allowance >= 0) next();
        else next(new Error(
            strs.allowanceExceeded + ': wait ' +
            Math.ceil((1 + -socket.allowance) / consts.socketRate) + ' secs'
        ));
    });
    next();
});

login.addHandlers(lobby, game);

// Listen on port
var port = process.env.PORT || consts.defaultPort;
server.listen(port, () => log('Listening on port', port));

// Setup stdin to listen to commands
let commands = {
    reload: () => {
        log('Reload');
        io.emit(msgs.reload, true);
    },
    exit: () => {
        log('Exiting');
        game.exit();
        process.exit();
    }
};
let unknown = cmd => warn('Command unknown', '"' + cmd + '"');
var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', cmd => {
    cmd = cmd.replace(/\s/g, '');
    if (!cmd.length) return;
    (commands[cmd] || unknown)(cmd);
});