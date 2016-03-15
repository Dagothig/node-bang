var ui = require('./ui'),
    misc = require('./misc');

module.exports = function(onMessage) {
    var element = ui.one('#lobby'),
        usersList = ui.one(element, '.users'),
        messagesList = ui.one(element, '.messages'),
        messageForm = ui.one(element, 'form'),
        message = ui.one(messageForm, '[name=message]'),
        messageBtn = ui.one(messageForm, '[type=submit]');

    messageForm.onsubmit = function() {
        onMessage(message.value);
        message.value = '';
        messageBtn.className += ' active';
        window.setTimeout(() =>  messageBtn.className = messageBtn.className.replace(' active', ''), 100);
        return false;
    };

    return {
        element: element,
        usersList: usersList,
        messagesList: messagesList,
        messageForm: messageForm,
        message: message,

        handleUsers: function(current, users) {
            usersList.innerHTML = '';
            if (!users) return;

            function surroundWith(tag, clazz, obj) {
                return '<' + tag + ' class="' + clazz + '">' + obj + '</' + tag + '>';
            }
            function getTag(user) {
                var tag = user.name
                if (misc.isCurrent(current, user)) tag = surroundWith('em', '', tag);
                return surroundWith('div', '', tag);
            }
            var html = '';
            users
                .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .forEach((user) => html += getTag(user));
            usersList.innerHTML = html;
        },
        handleMessage: function(name, message) {
            messagesList.innerHTML =
                '<div>' + name + ' : ' + message + '</div>' +
                messagesList.innerHTML;
        }
    };
};
