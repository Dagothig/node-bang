(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var msgs = require('./shared/messages.js'),
    ui = require('./client/ui.js');

var socket = io(),
    user,
    users;

var roots = ui.many('body>*'),
    loader = ui.one('#loader'),

    game = ui.one('#game'),
    gameCanvas = ui.one(game, 'canvas'),
    lobby = ui.one(game, '.lobby'),
    usersList = ui.one(game, '.users .list'),
    messagesList = ui.one(game, '.messages .list'),
    messageForm = ui.one(game, 'form'),
    message = ui.one(messageForm, '[name=message]'),

    loginContainer = ui.one('#login-container'),
    login = ui.one('#login'),
    formError = ui.one(login, '.form-error'),
    name = ui.one(login, '[name=name]'),
    password = ui.one(login, '[name=password]');

ui.hide(roots);

login.onsubmit = function() {
    ui.hide(roots);
    ui.show(loader);
    socket.emit(msgs.auth, {
        name: name.value,
        password: password.value
    });
    return false;
};

messageForm.onsubmit = function() {
    socket.emit(msgs.message, {
        token: user.token,
        message: message.value
    });
    message.value = '';
    return false;
};

socket.on(msgs.alert, function(msg) {
    alert(msg);
});
socket.on(msgs.auth, function(msg) {
    formError.innerText = msg ? msg.reason : '';
    ui.hide(roots);
    ui.show(loginContainer);
});
socket.on(msgs.user, function(msg) {
    if (user && !msg) {
        ui.hide(roots);
        ui.show(loginContainer);
    }
    if (!user && msg) {
        ui.hide(roots);
        ui.show(game);
    }
    user = msg;
    console.log(user);
});
socket.on(msgs.users, function(msg) {
    users = msg;
    usersList.innerHTML = '';
    msg.forEach((obj) => usersList.innerHTML = '<div>' + obj.name + '</div>' + messagesList.innerHTML);
});
socket.on(msgs.message, function(msg) {
    messagesList.innerHTML = '<div>' + msg.name + ' : ' + msg.message + '</div>' + messagesList.innerHTML;
});

},{"./client/ui.js":2,"./shared/messages.js":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = {
    alert: 'alert',
    auth: 'auth',
    user: 'user',
    users: 'users',
    game: 'game',
    message: 'message',
    play: 'play'
};

},{}]},{},[1]);
