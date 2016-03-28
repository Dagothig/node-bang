var ui = require('./ui'),
    misc = require('./misc'),
    consts = require('../shared/consts');

function Game(onAction) {
    this.onAction = onAction;
    this.tagGame = ui.one('#game-v2');
    ui.hide(this.tagGame);
}
Game.prototype = {
    constructor: Game,

    handleGame: function(game, current) {

    },

    handleEvent: function(msg) {

    },

    update: function(delta) {
        
    }
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);