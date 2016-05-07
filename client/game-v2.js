var ui = require('./ui'),
    misc = require('./misc'),
    consts = require('../shared/consts'),
    Card = require('./game/card'),
    Pile = require('./game/pile'),
    Player = require('./game/player');

function Game(settings, onAction) {
    this.onAction = onAction;
    this.tagGame = ui.one('#game-v2');
    settings.bind('newInterface', val => {
        this.useInterface = val;
        this.handleGame(this.game, this.game)
    });

    this.game = null;
    this.players = null;
    this.anglePerPlayer = null;
    this.pile = null;
    this.discard = null;

    window.addEventListener('resize', ev => this.requestPositions());
    this.resizeTime = 100;
    this.resizeFunc = () => {
        this.resizeTimeout = null;
        this.updatePositions();
    };
    this.resizeTimeout = null;
}
Game.prototype = {
    constructor: Game,

    handleGame: function(game, current) {
        if (game) {
            if (this.useInterface) ui.show(this.tagGame);
            else ui.hide(this.tagGame);

            this.displayGame(game, current);
        } else {
            ui.hide(this.tagGame);
        }
    },

    handleEvent: function(msg) {

    },

    update: function(delta) {

    },

    displayGame: function(game, current) {
        this.tagGame.innerHTML = '';
        this.game = game;

        if (game.players) {
            this.players = [];
            this.anglePerPlayer = Math.TWO_PI / game.players.length;

            // Find the shift so that the current player is centered
            let shift;
            for (shift = 0; shift < game.players.length; shift++) {
                if (game.players[shift].hand.cards.length !== undefined) break;
            }

            for (let i = game.players.length - 1; i >= 0; i--) {
                let playerInfo = game.players[i];
                let player = new Player().setInfo(playerInfo);
                this.tagGame.appendChild(player.tagRoot);

                // The angle is shifted by a quarter-circle because we want to
                // start center-bottom
                player.angle = (i - shift) * this.anglePerPlayer + (Math.HALF_PI);
                this.players[i] = player;
            }

            this.pile = new Pile().setInfo(game.cards.pile);
            this.tagGame.appendChild(this.pile.tagRoot);

            this.discard = new Pile().setInfo(game.cards.discard);
            this.tagGame.appendChild(this.discard.tagRoot);

            this.requestPositions();
        }
    },

    requestPositions: function() {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(this.resizeFunc, this.resizeTime);
    },
    updatePositions: function() {
        let halfSize = {
            x: this.tagGame.offsetWidth / 2,
            y: this.tagGame.offsetHeight / 2
        };
        let centerSize = this.pile. topCard.getHeight() * 0.6;
        if (this.players) this.players.forEach(p => {
            let heightShift =
                p.hand.getHeight() / 2 +
                p.equipment.getHeight() * (1 - Player.equipmentOverlap);
            let dirX = Math.cos(p.angle);
            let dirY = Math.sin(p.angle);
            let remain = Math.max(Math.sqrt(
                Math.pow(dirX * halfSize.x, 2) +
                Math.pow(dirY * halfSize.y, 2)
            ) - centerSize - p.getHeight(), 0) * 0.75;
            p.move(
                halfSize.x + dirX * (heightShift + centerSize + remain),
                halfSize.y + dirY * (heightShift + centerSize + remain)
            ).rotate(p.angle)
        });

        if (this.pile) this.pile.move(
            halfSize.x + 1.1 * this.pile.getWidth() / 2,
            halfSize.y
        );

        if (this.discard) this.discard.move(
            halfSize.x - 1.1 * this.discard.getWidth() / 2,
            halfSize.y
        );
    }
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);