var msgs = require('./shared/messages.js'),
    ui = require('./client/ui.js');

var socket = io(),
    user,
    ongoingGame,
    users;

var roots = ui.many('body>*'),
    loader = ui.one('#loader'),
    connectedContainer = ui.one('#connected-container');

var login = require('./client/login.js')(
    function onLogin(name, password) {
        ui.hide(roots);
        ui.show(loader);
        socket.emit(msgs.auth, {
            name: name,
            password: password
        });
    }
);
var lobby = require('./client/lobby.js')(
    function onMessage(message) {
        socket.emit(msgs.message, {
            token: user.token,
            message: message
        });
    }
);
var game = require('./client/game.js')(
    function onJoin(joining) {
        socket.emit(msgs.joining, {
            token: user.token,
            joining: joining
        });
    },
    function onGame(game) {
        ongoingGame = game;
        if (!users) socket.emit(msgs.users);
        else lobby.handleUsers(user, users, ongoingGame);
    }
);

ui.hide(roots);

socket.on('connect', function() {});
socket.on('disconnect', function() {
    ui.hide(roots);
    ui.show(loader);
});
socket.on(msgs.alert, function(msg) {
    alert(msg);
});
socket.on(msgs.auth, function(msg) {
    if (user) {
        socket.emit(msgs.auth, {
            name: user.name,
            token: user.token
        });
    } else {
        login.handleAuth(msg);
        ui.hide(roots);
        ui.show(login.element);
    }
});
socket.on(msgs.user, function(msg) {
    if (user && !msg) {
        ui.hide(roots);
        ui.show(login.element);
    }
    if (!user && msg) {
        ui.hide(roots);
        ui.show(connectedContainer);
    }
    user = msg;
    lobby.handleUsers(user, users, ongoingGame);
});
socket.on(msgs.users, function(msg) {
    users = msg;
    lobby.handleUsers(user, users, ongoingGame);
});
socket.on(msgs.message, function(msg) {
    lobby.handleMessage(msg.name, msg.message);
});
socket.on(msgs.joining, function(msg) {
    game.handleJoining(user, msg);
});
socket.on(msgs.game, function(msg) {
    game.handleGame(msg);
});
