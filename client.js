var msgs = require('./shared/messages'),
    strs = require('./shared/strings'),
    ui = require('./client/ui'),
    misc = window.misc = require('./client/misc');

var strat = require('./client/local-storage-strat');
var settings = require('./client/settings')(strat, {
    saveToken: [true, 'bool', 'user'],
    name: ['', 'str', 'sys'],
    token: ['', 'str', 'sys']
});
settings.bind('saveToken', val => !val ? settings.clear('name', 'token') : 0);

var socket = io(),
    user, users, joining, ongoing;
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
var unknown = require('./client/unknown.js')(
    function onRetry() {
        ui.hide(roots);
        ui.show(loader);
        socket.emit(msgs.joining, {
            token: user.token
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
var pregame = require('./client/pre-game')(settings,
    function onJoin(joining) {
        socket.emit(msgs.joining, {
            token: user.token,
            joining: joining
        });
    }
);
var game = window.game = require('./client/game.js')(settings,
    function onAction(action, arg) {
        socket.emit(msgs.action, {
            token: user.token,
            action: action,
            arg: arg
        });
    }
);

function udpateVisbility() {
    ui.hide(roots);
    if (!user) {
        ui.show(login.element);
    } else {
        ui.show(connectedContainer);
        ui.hide(game.tagRoot, pregame.tagRoot, unknown.element);
        if (ongoing) ui.show(game.tagRoot);
        else if (joining) ui.show(pregame.tagRoot);
        else ui.show(unknown.element);
    }

}
ui.hide(roots);
ui.show(loader);

var on = (key, func) => socket.on(key, func);
on('connect', () => {});
on('disconnect', () => {
    ui.hide(roots);
    ui.show(loader);
});
on('error', msg => {
    if (user) lobby.handleError(msg);
    else login.handleAuth({ reason: msg });
    udpateVisbility();
});
on(msgs.alert, msg => alert(msg));
on(msgs.reload, () => window.location.reload());
on(msgs.auth, msg => {
    // If there is a msg, then it is an answer to a previous communication and should be handled as such: Otherwise, it is just an auth challenge and we can check if we aren't already able to complete it without user input
    if (msg) {
        if (msg.reason === strs.authToken) {
            user = null;
            settings.clear('token')
        }
    } else {
        if (!user && settings.name && settings.token)
            user = {
                name: settings.name,
                token: settings.token
            };

        if (user)
            socket.emit(msgs.auth, {
                name: user.name,
                token: user.token
            });
    }

    login.handleAuth(msg);
    udpateVisbility();
});
on(msgs.user, msg => {
    user = msg;
    if (user && settings.saveToken) {
        settings.name = user.name;
        settings.token = user.token;
    } else settings.clear('token');
    if (user && !ongoing && !joining)
        socket.emit(msgs.joining, { token: user.token });

    lobby.handleUsers(user, users);
    udpateVisbility();
});
on(msgs.users, msg => {
    users = msg;
    lobby.handleUsers(user, users);
});
on(msgs.message, m => lobby.handleMessage(m.name, m.message));
on(msgs.joining, msg => {
    ongoing = null;
    joining = msg;

    pregame.handleJoining(user, msg)
    udpateVisbility();
});
on(msgs.game, msg => {
    ongoing = msg;
    joining = null;
    udpateVisbility();

    game.handleGame(msg, user);
    if (msg && msg.turn && msg.turn.step && msg.turn.step.event)
        game.handleEvent(msg.turn.step.event);
});
on(msgs.event, msg => game.handleEvent(msg));