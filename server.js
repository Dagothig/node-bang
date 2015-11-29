var express = require('express'),
    http = require('http'),
    socketIO = require('socket.io'),

    log = require('./server/log.js'),
    users = require('./server/users.js'),

    lobby = require('./server/lobby.js'),
    login = require('./server/login.js');

var app = express(),
    server = http.Server(app),
    io = socketIO(server);

app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/pages/index.html');
});

login.setup(io, users);
lobby.setup(io, users, login);

server.listen(8080, function() {
    log('Listening on port 8080');
});
