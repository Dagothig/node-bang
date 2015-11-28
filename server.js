var express = require('express'),
    http = require('http'),
    socketIO = require('socket.io'),
    chalk = require('chalk'),

    app = express(),
    server = http.Server(app),
    io = socketIO(server),
    prefix = '[' + chalk.yellow('Bang!') + ']';

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/pages/index.html');
});

io.on('connection', function(socket) {
    console.log(prefix, 'a user connected');
    socket.on('disconnect', function() {
        console.log(prefix, 'user disconnected');
    });
});

server.listen(8080, function() {
    console.log(prefix, 'Listening on port 8080');
});
