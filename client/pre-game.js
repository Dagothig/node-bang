var ui = require('./ui'),
    misc = require('./misc');

var gameEvents = [];

module.exports = function(settings, onJoin) {
    var tagRoot = ui.one('#pre-game'),
        tagPreForm = ui.one(tagRoot, 'form'),
        tagPreHeader = ui.one(tagPreForm, '.form-header'),
        tagPreError = ui.one(tagPreForm, '.form-error'),
        tagPreCount = ui.one(tagPreForm, '#player-count'),
        tagPreJoin = ui.one(tagPreForm, '[name=join]'),
        tagPlayers = ui.one(tagPreForm, '#joining');

    tagPreJoin.onclick = () => {
        onJoin(tagPreJoin.checked);
        return false;
    };

    return {

        tagRoot: tagRoot,

        handleJoining: function(current, msg) {
            if (!msg) return;

            var users = msg.users;
            tagPreError.innerHTML = msg.reason ? msg.reason : '';

            tagPreJoin.checked =
                !!users.find((user) => misc.isCurrent(current, user));

            tagPreCount.innerHTML =
                users.reduce((acc, user) => acc + 1, 0) +
                " / " +
                msg.minPlayers + "-" + msg.maxPlayers;

            tagPlayers.innerHTML =
                users.length ?
                    users.sort(user => user.name).reduce((acc, user) =>
                        acc + '<div><em>' + user.name + '</em></div>', '') :
                    '<div>No players yet</div>';
        }
    };
}