var ui = require('./ui'),
    misc = require('./misc'),
    consts = require('../shared/consts');

function Game(onJoin, onAction) {
    this.onJoin = onJoin;
    this.onAction = onAction;
}
Game.prototype = {
    constructor: Game
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);