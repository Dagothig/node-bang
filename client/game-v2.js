var ui = require('./ui'),
    misc = require('./misc'),
    consts = require('../shared/consts');

function Game(settings, onAction) {
    this.onAction = onAction;
    this.tagGame = ui.one('#game-v2');
    settings.bind('newInterface', val => {
        this.useInterface = val;
        this.handleGame(this.game, this.game)
    });
}
Game.prototype = {
    constructor: Game,

    handleGame: function(game, current) {
        if (game) {
            if (this.useInterface) ui.show(this.tagGame);
            else ui.hide(this.tagGame);
        } else {
            ui.hide(this.tagGame);
        }
    },

    handleEvent: function(msg) {

    },

    update: function(delta) {

    }
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);