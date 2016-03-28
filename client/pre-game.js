var ui = require('./ui'),
    misc = require('./misc');

var gameEvents = [];

module.exports = function(onJoin) {
    var tagPre = ui.one('#pre-game'),
        tagPreForm = ui.one(tagPre, 'form'),
        tagPreHeader = ui.one(tagPreForm, '.form-header'),
        tagPreError = ui.one(tagPreForm, '.form-error'),
        tagPreCount = ui.one(tagPreForm, '#player-count'),
        tagPreJoin = ui.one(tagPreForm, '[name=join]');

    tagPreJoin.onchange = function(e) {
        onJoin(e.target.checked);
    };

    return {

        handleJoining: function(current, msg) {
            var users = msg ? msg.users : null;
            tagPreError.innerHTML = msg.reason ? msg.reason : '';
            tagPreJoin.checked = !!users.find((user) => misc.isCurrent(current, user));
            tagPreCount.innerHTML =
                users.reduce((acc, user) => acc + 1, 0) +
                " / " +
                msg.minPlayers + "-" + msg.maxPlayers;
        },

        handleGame: function(game, current) {
            if (game) ui.hide(tagPre);
            else ui.show(tagPre);
        }
    };
}