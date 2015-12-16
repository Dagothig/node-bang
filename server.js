require('./global');

var log = aReq('server/log');

// Setup the server itself
var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.Server(app);

// Setup the static assets and routes
app.use(express.static('public'));
require('fs').readdir('./pages', (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
        var stripped = file.replace('.html', '');
        app.get('/' + stripped === 'index' ? '' : stripped, (req, res) => {
            res.sendFile(__dirname + '/pages/' + file);
        });
    });
});

// Setup the server sockets functionalities
var socketIO = require('socket.io'),
    io = socketIO(server),

    users = aReq('server/users'),

    login = aReq('server/login'),
    game = aReq('server/game'),
    lobby = aReq('server/lobby');

login.setup(io, users);
game.setup(io, users, login);
lobby.setup(io, users, login);

// Listen on port
var port = process.env.PORT || 8080;
server.listen(port, function() {
    log('Listening on port', port);
});