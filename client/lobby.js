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
