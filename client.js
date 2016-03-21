var msgs = require('./shared/messages.js'),
    ui = require('./client/ui.js'),
    misc = require('./client/misc.js');

var socket = io(),
    user,
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
var menu = require('./client/menu.js')(
    function onDisconnect() {
        if (confirm('Are you certain you want to disconnect?')) {
            localStorage.removeItem('name');
            localStorage.removeItem('token');
            window.location.reload();
        }
    }
);
var game = require('./client/game.js')(
    function onJoin(joining) {
        socket.emit(msgs.joining, {
            token: user.token,
            joining: joining
        });
    },
    function onAction(action, arg) {
        socket.emit(msgs.action, {
            token: user.token,
            action: action,
            arg: arg
        });
    }
);

ui.hide(roots);

var lastTime;
(function updater() {
    var time = performance.now();
    game.update((time - lastTime)/1000);
    lastTime = time;
    requestAnimationFrame(updater);
}());

socket.on('connect', function() {
    console.log('connected');
});
socket.on('disconnect', function() {
    console.log('disconnected');
    ui.hide(roots);
    ui.show(loader);
});
socket.on(msgs.alert, function(msg) {
    console.log('received', msgs.alert, msg);
    alert(msg);
});
socket.on(msgs.reload, function(msg) {
    console.log('received', msgs.alert, msg);
    window.location.reload();
});
socket.on(msgs.auth, function(msg) {
    console.log('received', msgs.auth, msg);
    if (!user) {
        var name = localStorage.getItem('name');
        var token = localStorage.getItem('token');
        if (name && token) user = { name: name, token: token };
    }
    if (user) {
        socket.emit(msgs.auth, {
            name: user.name,
            token: user.token
        });
        user = null;
        localStorage.removeItem('name');
        localStorage.removeItem('token');
    } else {
        login.handleAuth(msg);
        ui.hide(roots);
        ui.show(login.element);
    }
});
socket.on(msgs.user, function(msg) {
    console.log('received', msgs.user, msg);
    if (user && !msg) {
        ui.hide(roots);
        ui.show(login.element);
    }
    if (!user && msg) {
        ui.hide(roots);
        ui.show(connectedContainer);
    }
    user = msg;
    // todo actually save stuff
    //localStorage.setItem('name', msg && msg.name);
    //localStorage.setItem('token', msg && msg.token);
    lobby.handleUsers(user, users);
});
socket.on(msgs.users, function(msg) {
    console.log('received', msgs.users, msg);
    users = msg;
    lobby.handleUsers(user, users);
});
socket.on(msgs.message, function(msg) {
    console.log('received', msgs.message, msg);
    lobby.handleMessage(msg.name, msg.message);
});
socket.on(msgs.joining, function(msg) {
    console.log('received', msgs.joining, msg);
    game.handleJoining(user, msg);
});
socket.on(msgs.game, function(msg) {
    console.log('received', msgs.game, msg);
    game.handleGame(msg, user);
});

socket.on(msgs.event, function(msg) {
    console.log('received', msgs.event, msg);
    game.handleEvent(msg);
});