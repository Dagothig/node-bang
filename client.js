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

var all = Array.from(roots)
    .concat([game.tagRoot, pregame.tagRoot, unknown.element]);
function updateVisbility(limbo) {
    if (limbo) {
        ui.hide(roots);
        ui.show(loader);
        return;
    }

    let toHide = all.slice();
    let toShow = [
        user ? connectedContainer :
        login.element,

        ongoing ? game.tagRoot :
        joining ? pregame.tagRoot :
        unknown.element
    ];
    toHide = toHide.filter(e => !ui.hidden(e) && toShow.indexOf(e) === -1);
    toShow = toShow.filter(e => ui.hidden(e));
    ui.hide(toHide);
    ui.show(toShow);

    if (toShow.indexOf(connectedContainer) >= 0)
        lobby.message.focus();
    else if (toShow.indexOf(login.element) >= 0)
        login.name.focus();
}
updateVisbility(true);

/*var on = (key, func) => socket.on(key, function() {
    console.log('received', key, 'args:');
    for (var arg in arguments) console.log(arguments[arg]);
    if (func) func.apply(this, arguments);
});
socket.__emit = socket.emit;
socket.emit = function(key) {
    console.log('sent', key, 'args:');
    for (var arg in arguments) console.log(arguments[arg]);
    socket.__emit.apply(socket, arguments);
}*/
var on = (key, func) => socket.on(key, func);
on('connect', () => {});
on('disconnect', () => updateVisbility(true));
on('error', msg => {
    if (user) lobby.handleError(msg);
    else login.handleAuth({ reason: msg });
    updateVisbility();
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
        if (user)
            socket.emit(msgs.auth, {
                name: user.name,
                token: user.token
            });
        else if (!user && settings.name && settings.token) {
            // Because we have no way of knowing if this handle is fine, we must got to lmb
            socket.emit(msgs.auth, {
                name: settings.name,
                token: settings.token
            });
            return updateVisbility(true);
        }
    }

    login.handleAuth(msg);
    updateVisbility();
});
on(msgs.user, msg => {
    user = msg;
    if (user && settings.saveToken) {
        settings.name = user.name;
        settings.token = user.token;
    } else settings.clear('token');
    lobby.handleUsers(user, users);
    if (user && !ongoing && !joining) {
        socket.emit(msgs.joining, { token: user.token });
        updateVisbility(true);
    } else updateVisbility();
});
on(msgs.users, msg => {
    users = msg;
    lobby.handleUsers(user, users);
});
on(msgs.message, m => lobby.handleMessage(m.name, m.message));
on(msgs.joining, msg => {
    if (msg) {
        ongoing = null;
        joining = msg;

        pregame.handleJoining(user, msg)
    } else joining = null;
    updateVisbility();
});
on(msgs.game, msg => {
    if (msg) {
        ongoing = msg;
        joining = null;
        updateVisbility();

        if (msg && msg.turn && msg.turn.step && msg.turn.step.event)
            game.handleEvent(msg.turn.step.event);
        game.handleGame(msg, user);
    } else ongoing = null;
    updateVisbility();
});
on(msgs.event, msg => game.handleEvent(msg));

function verifyCheck(c) {
    return Object.entries(c).find(entry => {
        if (entry[1] !== true || entry[1] !== false) {
            let subcheck = verifyCheck(entry[1]);
            if (subcheck) return entry[0] + ':' + subcheck;
            return false;
        }
        if (entry[1]) return false;
        return entry[0];
    });
}