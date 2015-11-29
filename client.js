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
