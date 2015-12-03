var ui = require('./ui.js'),
    misc = require('./misc.js');

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
            precount.innerText = users.reduce((acc, user) => acc + 1, 0) + " / 4-7";
        },

        handleGame: function handleGame(game) {
            if (game) {
                ui.show(element);
                ui.hide(pre);

                var acts = game.actions;
                console.log(acts);
                var tag = '';
                for (var a in acts) {
                    console.log(acts[a]);
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
                    console.log(action, arg);
                });
            } else {
                ui.hide(element);
                ui.show(pre);
            }
            onGame(game);
        }
    };
}
