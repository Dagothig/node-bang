var msgs = require('./shared/messages'),
    ui = require('./client/ui'),
    misc = window.misc = require('./client/misc');

var strat = require('./client/local-storage-strat');
var settings = require('./client/settings')(strat, {
    saveToken: [true, 'bool', 'user'],
    sound: [false, 'bool', 'user'],
    newInterface: [true, 'bool', 'user'],
    name: ['', 'str', 'sys'],
    token: ['', 'str', 'sys']
});
settings.bind('saveToken', val => {
    if (!val) settings.name = settings.token = '';
});

var socket = io(),
    user,
    users;
window.socket = socket;

var roots = ui.many('body>*'),
    loader = ui.one('#loader'),
    connectedContainer = ui.one('#connected-container');

var login = require('./client/login.js')(settings,
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
var menu = require('./client/menu.js')(settings,
    function onDisconnect() {
        if (confirm('Are you certain you want to disconnect?')) {
            settings.clear();
            window.location.reload();
        }
    }
);
var pregame = require('./client/pre-game')(
    function onJoin(joining) {
        socket.emit(msgs.joining, {
            token: user.token,
            joining: joining
        });
    }
);
var game = require('./client/game.js')(settings,
    function onAction(action, arg) {
        socket.emit(msgs.action, {
            token: user.token,
            action: action,
            arg: arg
        });
    }
);
var gameV2 = require('./client/game-v2.js')(settings,
    function onAction(action, arg) {
        socket.emit(msgs.action, {
            token: user.token,
            action: action,
            arg: arg
        });
    }
);

var icon = require('./client/icon.js')(
    ['favicon.ico', 'favicon-alert.ico'],
    ['¡Bang!', '!Bang¡'],
    1000);
icon.state = {
    _focus: false,
    _stuff: false,

    set focus(focus) {
        this._focus = focus;
        icon.flash((this._stuff = (this._stuff && !focus)) && user);
    },
    set stuff(stuff) {
        icon.flash((this._stuff = (stuff && !this._focus)) && user);
    }
};

window.onfocus = () => icon.state.focus = true;
window.onblur = () => icon.state.focus = false;

ui.hide(roots);

var lastTime;
(function updater() {
    var time = performance.now();
    game.update((time - lastTime)/1000);
    lastTime = time;
    requestAnimationFrame(updater);
}());

var on = (key, func) => socket.on(key, function() {
    console.log(key, arguments);
    icon.state.stuff = true;
    if (func) func.apply(this, arguments);
});
on('connect', () => {});
on('disconnect', () => {
    ui.hide(roots);
    ui.show(loader);
});
on(msgs.alert, msg => alert(msg));
on(msgs.reload, () => window.location.reload());
on(msgs.auth, msg => {
    if (!user) {
        var name = settings.name;
        var token = settings.token;
        if (name && token) user = { name: name, token: token };
    }
    if (user) {
        socket.emit(msgs.auth, {
            name: user.name,
            token: user.token
        });
        user = null;
        settings.clear('name', 'token');
    } else {
        login.handleAuth(msg);
        ui.hide(roots);
        ui.show(login.element);
        login.name.focus();
    }
});
on(msgs.user, msg => {
    if (user && !msg) {
        ui.hide(roots);
        ui.show(login.element);
        login.name.focus();
    }
    if (!user && msg) {
        ui.hide(roots);
        ui.show(connectedContainer);
        lobby.message.focus();
    }
    user = msg;
    if (settings.saveToken) {
        settings.name = (msg && msg.name) || '';
        settings.token = (msg && msg.token) || '';
    }
    lobby.handleUsers(user, users);

    socket.emit(msgs.joining, { token: user.token });
    socket.emit(msgs.game, { token: user.token });
});
on(msgs.users, msg => {
    users = msg;
    lobby.handleUsers(user, users);
});
on(msgs.message, m => lobby.handleMessage(m.name, m.message));
on(msgs.joining, msg => pregame.handleJoining(user, msg));
on(msgs.game, msg => {
    pregame.handleGame(msg, user);
    game.handleGame(msg, user);
    gameV2.handleGame(msg, user);
    if (msg && msg.turn && msg.turn.step && msg.turn.step.event) {
        game.handleEvent(msg.turn.step.event);
        gameV2.handleEvent(msg.turn.step.event);
    }
});
on(msgs.event, msg => {
    game.handleEvent(msg);
    gameV2.handleEvent(msg);
});