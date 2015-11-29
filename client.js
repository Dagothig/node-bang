var msgs = require('./shared/messages.js'),
    ui = require('./client/ui.js');

var socket = io(),
    user;

var roots = ui.many('body>*'),

    game = ui.one('#game'),

    loader = ui.one('#loader'),

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
});
