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
    },
    function onAction(action) {
        socket.emit(msgs.action, {
            token: user.token,
            action: action
        });
    }
);

ui.hide(roots);

socket.on('connect', function() {});
socket.on('disconnect', function() {
    ui.hide(roots);
    ui.show(loader);
});
socket.on(msgs.alert, function(msg) {
    console.log(msgs.alert, msg);
    alert(msg);
});
socket.on(msgs.auth, function(msg) {
    console.log(msgs.auth, msg);
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
    console.log(msgs.user, msg);
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
    console.log(msgs.users, msg);
    users = msg;
    lobby.handleUsers(user, users, ongoingGame);
});
socket.on(msgs.message, function(msg) {
    console.log(msgs.message, msg);
    lobby.handleMessage(msg.name, msg.message);
});
socket.on(msgs.joining, function(msg) {
    console.log(msgs.joining, msg);
    game.handleJoining(user, msg);
});
socket.on(msgs.game, function(msg) {
    console.log(msgs.game, msg);
    game.handleGame(msg);
});
