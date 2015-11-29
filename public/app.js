(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var msgs = require('./shared/messages.js'),
    ui = require('./client/ui.js');

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
var game = require('./client/game.js')(
    function onJoin(joining) {
        socket.emit(msgs.joining, {
            token: user.token,
            joining: joining
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
    alert(msg);
});
socket.on(msgs.auth, function(msg) {
    if (user) {
        socket.emit(msgs.auth, {
            name: user.name,
            token: user.token
        });
    } else {
        login.formError.innerText = msg ? msg.reason : '';
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
    lobby.handleUsers(user, users);
});
socket.on(msgs.users, function(msg) {
    users = msg;
    lobby.handleUsers(user, users);
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

},{"./client/game.js":2,"./client/lobby.js":3,"./client/login.js":4,"./client/ui.js":6,"./shared/messages.js":7}],2:[function(require,module,exports){
var ui = require('./ui.js'),
    misc = require('./misc.js');

module.exports = function(onJoin) {
    var element = ui.one('#game'),
        pre = ui.one('#pre-game'),
        preform = ui.one(pre, 'form'),
        preheader = ui.one(preform, '.form-header'),
        precount = ui.one(preform, '#player-count'),
        prejoin = ui.one(preform, '[name=join]');

    prejoin.onchange = function(e) {
        onJoin(e.target.checked);
    };

    return {
        element: element,
        pre: pre,
        preform: preform,
        preheader: preheader,
        precount: precount,
        prejoin: prejoin,

        handleJoining: function handleJoining(current, users) {
            prejoin.checked = !!users.find((user) => misc.isCurrent(current, user));
            precount.innerText = users.reduce((acc, user) => acc + 1, 0) + " / 4-7";
        },

        handleGame: function handleGame(game) {
            if (game) {
                ui.show(element);
                ui.hide(pre);
            } else {
                ui.hide(element);
                ui.show(pre);
            }
        }
    };
}

},{"./misc.js":5,"./ui.js":6}],3:[function(require,module,exports){
var ui = require('./ui.js'),
    misc = require('./misc.js');

module.exports = function(onMessage) {
    var element = ui.one('#lobby'),
        usersList = ui.one(element, '.users .list'),
        messagesList = ui.one(element, '.messages .list'),
        messageForm = ui.one(element, 'form'),
        message = ui.one(messageForm, '[name=message]');

    messageForm.onsubmit = function() {
        onMessage(message.value);
        message.value = '';
        return false;
    };

    return {
        element: element,
        usersList: usersList,
        messagesList: messagesList,
        messageForm: messageForm,
        message: message,

        handleUsers: function handleUsers(current, users) {
            usersList.innerHTML = '';
            if (!users) return;

            function surroundWith(tag, obj) {
                return '<' + tag + '>' + obj + '</' + tag + '>';
            }
            function getTag(user) {
                var tag = user.name
                if (misc.isCurrent(current, user)) tag = surroundWith('em', tag);
                return surroundWith('div', tag);
            }
            var html = '';
            users
                .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .forEach((user) => html += getTag(user));
            usersList.innerHTML = html;
        },
        handleMessage: function handleMessage(name, message) {
            messagesList.innerHTML =
                '<div>' + name + ' : ' + message + '</div>' +
                messagesList.innerHTML;
        }
    };
};

},{"./misc.js":5,"./ui.js":6}],4:[function(require,module,exports){
var ui = require('./ui.js');

module.exports = function(onLogin) {
    var element = ui.one('#login'),
        form = ui.one(element, 'form'),
        formError = ui.one(form, '.form-error'),
        name = ui.one(form, '[name=name]'),
        password = ui.one(form, '[name=password]');

    element.onsubmit = function() {
        onLogin(name.value, password.value);
        return false;
    };

    return {
        element: element,
        form: form,
        formError: formError,
        name: name,
        password: password
    };
};

},{"./ui.js":6}],5:[function(require,module,exports){
module.exports = {
    isCurrent: function isCurrent(current, user) {
        return current &&
            user.name.toLowerCase() === current.name.toLowerCase();
    }
};

},{}],6:[function(require,module,exports){
function one() {
    if (arguments[0].querySelector) return arguments[0].querySelector(arguments[1]);
    else return document.body.querySelector(arguments[0]);
}
function many() {
    if (arguments[0].querySelectorAll) return arguments[0].querySelectorAll(arguments[1]);
    else return document.body.querySelectorAll(arguments[0]);
}
function show() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg.length) show.apply(this, arg);
        else if (arg.classList) arg.classList.remove('hidden');
    }
}
function hide() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg.length) hide.apply(this, arg);
        else if (arg.classList) arg.classList.add('hidden');
    }
}
module.exports = {
    one: one,
    many: many,
    show: show,
    hide: hide
};

},{}],7:[function(require,module,exports){
module.exports = {
    alert: 'alert',
    auth: 'auth',
    user: 'user',
    users: 'users',
    message: 'message',
    joining: 'joining',
    game: 'game'
};

},{}]},{},[1]);
