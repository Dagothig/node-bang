var ui = require('./ui.js'),
    misc = require('./misc.js');

module.exports = function(onJoin) {
    var element = ui.one('#game'),
        pre = ui.one('#pre-game'),
        preform = ui.one(pre, 'form'),
        preheader = ui.one(preform, '.form-header'),
        precount = ui.one(preform, '#player-count'),
        prejoin = ui.one(preform, '[name=join]');

    prejoin.onchange = function(e) {
        onJoin(e.target.checked);
    };

    return {
        element: element,
        pre: pre,
        preform: preform,
        preheader: preheader,
        precount: precount,
        prejoin: prejoin,

        handleJoining: function handleJoining(current, users) {
            prejoin.checked = !!users.find((user) => misc.isCurrent(current, user));
            precount.innerText = users.reduce((acc, user) => acc + 1, 0) + " / 4-7";
        },

        handleGame: function handleGame(game) {
            if (game) {
                ui.show(element);
                ui.hide(pre);
            } else {
                ui.hide(element);
                ui.show(pre);
            }
        }
    };
}
