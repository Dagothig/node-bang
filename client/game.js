var ui = require('./ui.js'),
    misc = require('./misc.js'),
    consts = require('../shared/consts.js');

module.exports = function(onJoin, onGame, onAction) {
    var element = ui.one('#game'),
        pre = ui.one('#pre-game'),
        preform = ui.one(pre, 'form'),
        preheader = ui.one(preform, '.form-header'),
        preerror = ui.one(preform, '.form-error'),
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

        handleJoining: function handleJoining(current, msg) {
            var users = msg ? msg.users : null;
            preerror.innerText = msg.reason ? msg.reason : '';
            prejoin.checked = !!users.find((user) => misc.isCurrent(current, user));
            precount.innerText =
                users.reduce((acc, user) => acc + 1, 0) +
                " / " +
                consts.minPlayers + "-" + consts.maxPlayers;
        },

        handleGame: function handleGame(game, current) {
            if (game) {
                ui.show(element);
                ui.hide(pre);

                var player = game && game.players ?
                    game.players.find((player) => misc.isCurrent(current, player)) :
                    null;

                // Time
                var tag = '';
                tag += '<div>' + game.remainingTime + '</div>'

                // Setup the actions
                var acts = game.actions;
                for (var a in acts) {
                    Array.prototype.forEach.call(acts[a], (arg) => {
                        tag +=
                            '<div class="action" data-action="' + a + '" data-arg="' + arg + '">'
                            + a + ' - ' + arg +
                            '</div>';
                    });
                }
                element.innerHTML = tag;
                Array.prototype.forEach.call(element.querySelectorAll('.action'), (actionTag) => {
                    var action = actionTag.getAttribute('data-action');
                    var arg = actionTag.getAttribute('data-arg');
                    actionTag.onclick = function (e) {
                        element.innerHTML = '';
                        onAction(action, arg);
                    }
                });
            } else {
                ui.hide(element);
                ui.show(pre);
            }
            onGame(game);
        }
    };
}
