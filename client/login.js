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
