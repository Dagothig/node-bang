var ui = require('./ui'),
    misc = require('./misc'),
    consts = require('../shared/consts');

module.exports = function(onJoin, onGame, onAction) {
    var tagGame = ui.one('#game'),
        tagExtra = ui.one(tagGame, '#extra'),
        tagPlayers = ui.one(tagGame, '#players'),
        tagActions = ui.one(tagGame, '#actions'),

        tagPre = ui.one('#pre-game'),
        tagPreForm = ui.one(tagPre, 'form'),
        tagPreHeader = ui.one(tagPreForm, '.form-header'),
        tagPreError = ui.one(tagPreForm, '.form-error'),
        tagPreCount = ui.one(tagPreForm, '#player-count'),
        tagPreJoin = ui.one(tagPreForm, '[name=join]');

    tagPreJoin.onchange = function(e) {
        onJoin(e.target.checked);
    };

    return {
        tagGame: tagGame,
        tagPre: tagPre,
        tagPreForm: tagPreForm,
        tagPreHeader: tagPreHeader,
        tagPreCount: tagPreCount,
        tagPreJoin: tagPreJoin,

        handleJoining: function(current, msg) {
            var users = msg ? msg.users : null;
            tagPreError.innerText = msg.reason ? msg.reason : '';
            tagPreJoin.checked = !!users.find((user) => misc.isCurrent(current, user));
            tagPreCount.innerText =
                users.reduce((acc, user) => acc + 1, 0) +
                " / " +
                consts.minPlayers + "-" + consts.maxPlayers;
        },

        handleGame: function(game, current) {
            if (game) {
                ui.show(tagGame);
                ui.hide(tagPre);

                this.display(tagExtra, game && {
                    remainingTime: game.remainingTime,
                    turn: game.turn
                });
                this.display(tagPlayers, game && game.players);
                this.displayActions(game && game.actions);
            } else {
                ui.hide(tagGame);
                ui.show(tagPre);
            }
            onGame(game);
        },

        display: function(tag, obj) {
            tag.innerHTML = obj ? ('<ul>'
                + Object.keys(obj)
                    .filter(k => obj[k] !== undefined)
                    .map(k => this.formatTree(k, obj[k]))
                    .reduce((s, e) => s + e, '')
                + '</ul>') : '';
        },

        displayPlayers: function(players) {
            if (!players) {
                tagPlayers.innerHTML = '';
                return;
            }

            var player = game && game.players ?
                game.players.find(player => misc.isCurrent(current, player)) :
                null;

            tagPlayers.innerHTML = players.reduce((s, p) => s + this.displayPlayer(p), '');
        },
        displayPlayer: function(player) {
            return '<div>' + player.name + '</div>';
        },

        displayActions: function(actions) {
            if (!actions) {
                tagActions.innerHTML = '';
                return;
            }

            var tag = '';

            // Setup the actions
            for (var a in actions) {
                Array.prototype.forEach.call(actions[a], arg => tag +=
                    '<div class="action" data-action="' + a + '" data-arg="' + arg + '">'
                    + a + ' - ' + arg +
                    '</div>'
                );
            }
            tagActions.innerHTML = tag;
            Array.prototype.forEach.call(tagActions.querySelectorAll('.action'), actionTag => {
                var action = actionTag.getAttribute('data-action');
                var arg = actionTag.getAttribute('data-arg');
                actionTag.onclick = function (e) {
                    tagActions.innerHTML = '';
                    onAction(action, arg);
                }
            });
        },

        formatTree: function(name, obj) {
            return '<li>'
                + '<div>' + name + '</div>'
                + Object.keys(obj).map(k =>
                    (typeof obj[k] === 'object') ?
                        ('<ul>' + this.formatTree(k, obj[k]) + '</ul>') :
                        ('<div>' + k + ': ' + obj[k] + '</div>')
                ).reduce((s, e) => s + e, '')
                + '</li>';
        }
    };
}
