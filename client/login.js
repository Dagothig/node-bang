var ui = require('./ui');

module.exports = function(settings, onLogin) {
    var element = ui.one('#login'),
        form = ui.one(element, 'form'),
        formError = ui.one(form, '.form-error'),
        name = ui.one(form, '[name=name]'),
        password = ui.one(form, '[name=password]'),
        saveToken = ui.one(form, '[name=save-token-login]');

    element.onsubmit = function() {
        name.value = name.value.trim();
        onLogin(name.value, password.value);
        password.value = '';
        return false;
    };

    settings.bind('saveToken', val => saveToken.checked = val);
    saveToken.onchange = function(e) {
        if (settings.saveToken !== saveToken.checked) 
            settings.saveToken = saveToken.checked;
    }

    return {
        element: element,
        form: form,
        formError: formError,
        name: name,
        password: password,
        saveToken: saveToken,

        handleAuth: function handleAuth(msg) {
            formError.innerHTML = msg ? msg.reason : '';
        }
    };
};
