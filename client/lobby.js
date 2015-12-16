var ui = require('./ui'),
    misc = require('./misc');

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

        handleUsers: function handleUsers(current, users, game) {
            usersList.innerHTML = '';
            if (!users) return;

            function surroundWith(tag, clazz, obj) {
                return '<' + tag + ' class="' + clazz + '">' + obj + '</' + tag + '>';
            }
            function getTag(user) {
                var tag = user.name
                if (misc.isCurrent(current, user)) tag = surroundWith('em', '', tag);
                var player = game ? game.players.find((player) => misc.areTheSame(player, user)) : null;
                var cssClass = player ? (player.life || !player.maxLife ? 'alive' : 'dead') : '';
                var prefix = player ? (
                    (player.character ? player.character.name + ' ' : '') +
                    (player.character && player.role ? ', ' : '') +
                    (player.role ? player.role.name + ' ' : '')
                ) :  '';
                return surroundWith('div', '', surroundWith('span', cssClass, prefix) + tag);
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
