var ui = require('./ui'),
    misc = require('./misc');

function Game(settings, onAction) {
    this.onAction = onAction;
    this.tagGame = ui.one('#game');
    this.tagExtra = ui.one(this.tagGame, '#extra');
    this.tagPlayers = ui.one(this.tagGame, '#players');
    this.tagActions = ui.one(this.tagGame, '#actions');
    this.tagEvents = ui.one(this.tagGame, '#events');
    this.gameEvents = [];
    this.displayedActions = [];
    settings.bind('newInterface', val => {
        this.useInterface = !val;
        this.handleGame(this.game, this.game)
    });
}
Game.prototype = {
    constructor: Game,

    handleGame: function(game, current) {
        if (game) {
            if (this.useInterface) ui.show(this.tagGame);
            else ui.hide(this.tagGame);

            this.display(this.tagExtra, game && {
                remainingTime: game.remainingTime,
                turn: game.turn,
                cards: game.cards
            });
            this.display(this.tagPlayers, game && game.players);
            this.displayActions(game && game.actions);
        } else {
            this.gameEvents.length = 0;
            ui.hide(this.tagGame);
        }

        if (!game || !this.game || game.identifier !== this.game.identifier) {
            this.gameEvents.length = 0;
            this.display(this.tagEvents, this.gameEvents);
        }

        this.game = game;
    },

    handleEvent: function(msg) {
        this.gameEvents.push(msg);
        while (this.gameEvents.length > 10) this.gameEvents.shift();
        this.display(this.tagEvents, this.gameEvents.slice().reverse());
    },

    update: function(delta) {
        if (!this.game
            || !this.game.turn
            || !this.game.turn.step
            || !this.game.turn.step.event) return;

        this.game.turn.step.event.time =
            Math.max(this.game.turn.step.event.time - delta, 0);
        this.display(this.tagExtra, this.game && {
            remainingTime: this.game.remainingTime,
            turn: this.game.turn,
            cards: this.game.cards
        });
    },

    display: function(tag, obj) {
        tag.innerHTML = obj ? this.format('', obj) : '';
    },

    displayPlayers: function(players) {
        if (!players) {
            this.tagPlayers.innerHTML = '';
            return;
        }

        var player = game && game.players ?
            game.players.find(player => misc.isCurrent(current, player)) :
            null;

        this.tagPlayers.innerHTML = players.reduce(
            (s, p) => s + this.displayPlayer(p), ''
        );
    },
    displayPlayer: function(player) {
        return '<div>' + player.name + '</div>';
    },

    displayActions: function(actions) {
        if (!actions) {
            this.tagActions.innerHTML = '';
            this.displayedActions = actions;
            return;
        }

        var same = this.displayedActions
            && JSON.stringify(this.displayedActions) === JSON.stringify(actions);
        if (same) return;
        this.displayedActions = actions;

        var tag = '';

        // Setup the actions
        var tabIndex = 1;
        for (var a in actions) {
            Array.prototype.forEach.call(actions[a], arg => tag +=
                '<div ' +
                    'tabindex="' + (++tabIndex) + '" ' +
                    'class="action" ' +
                    'data-action="' + a + '" ' +
                    'data-arg="' + arg + '"' +
                '>'
                + a + ' - ' + arg +
                '</div>'
            );
        }
        this.tagActions.innerHTML = tag;
        Array.prototype.forEach.call(this.tagActions.querySelectorAll('.action'), actionTag => {
                var action = actionTag.getAttribute('data-action');
                var arg = actionTag.getAttribute('data-arg');
                var self = this;
                actionTag.onclick = function (e) {
                    self.tagActions.innerHTML = '';
                    self.displayedActions = null;
                    self.onAction(action, arg);
                }
                actionTag.onkeydown = function(e) {
                    if (e.keyCode !== 32) return;
                    actionTag.onclick();
                }
            }
        );
    },

    format: function(name, obj) {
        var type = typeof obj;
        return (name.length ? name + ': ' : '') +
            ((type === 'object') ? this.formatTree(obj) :
            ((type === 'number') ? Math.round(obj) :
            obj));
    },
    formatTree: function(obj) {
        return '<ul>'
            + Object.keys(obj)
                .filter(k => obj[k] !== undefined)
                .reduce((s, k) => s + '<li>' + this.format(k, obj[k]) + '</li>', '')
            + '</ul>';
    }
};

module.exports = (settings, onAction) => new Game(settings, onAction);