var ui = require('./ui'),
    misc = require('./misc'),
    consts = require('../shared/consts'),
    Card = require('./game/card'),
    Cards = require('./game/cards'),
    Pile = require('./game/pile'),
    Player = require('./game/player');

function Game(settings, onAction) {
    this.onAction = onAction;
    this.tagRoot = ui.one('#game-v2');
    this.tagGame = ui.one(this.tagRoot, '.container');
    settings.bind('newInterface', val => {
        this.useInterface = val;
        this.handleGame(this.game, this.game)
    });
    this.tagCancel = ui.create('input', 'cancel-btn');
    this.tagCancel.type = 'button';
    this.tagCancel.value = 'Cancel';
    this.tagCancel.name = 'cancel';
    this.tagCancel.onclick = () => {
        ui.hide(this.tagCancel);
        this.onAction('cancel', 'cancel');
    };
    ui.hide(this.tagCancel);

    this.clearGame();

    window.addEventListener('resize', ev => this.requestPositions());
    this.resizeTime = 10;
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
            if (this.useInterface) ui.show(this.tagRoot);
            else ui.hide(this.tagRoot);

            this.displayGame(game, current);
        } else {
            ui.hide(this.tagRoot);

            if (this.game) this.clearGame();
        }
    },

    clearGame: function() {
        this.tagGame.innerHTML = '';
        this.tagGame.appendChild(this.tagCancel);

        this.game = null;
        this.players = null;
        this.pile = null;
        this.discard = null;
        this.emporio = null;
    },

    handleEvent: function(msg) {
        if (!this.game) return;

        let player = msg.player &&
            this.players.find(p => p.info.name === msg.player);
        let target = msg.target &&
            this.players.find(p => p.info.name === msg.target);
        switch (msg.name) {
            case 'draw':
                let func = arg => player.hand.append(source.draw(arg), arg);
                let source = (msg.from === 'pile' ? this.pile :
                    (msg.from === 'discard' ? this.discard :
                    (msg.from === 'hand' ? target.hand :
                    (msg.from === 'equipped' ? target.equipped :
                    (msg.from === 'emporio' ? this.emporio : null)))));

                if (msg.amount) for (let i = 0; i < msg.amount; i++) func();
                else if (msg.card) func(msg.card);
                else if (msg.cards) msg.cards.forEach(c => func(c));
                break;

            case 'discard':
                ((msg.card && [msg.card]) || msg.cards).forEach(c =>
                    this.discard.append(player[msg.from].draw(c), c)
                );
                break;

            case 'pile':
                ((msg.card && [msg.card]) || msg.cards).forEach(c =>
                    this.pile.append(player[msg.from].draw(c), c)
                );
                break;

            case 'equipped':
                let target = this.players.find(p => p.info.name === msg.target);
                target.equipped.append(player.hand.draw(msg.card), msg.card);
                break;

            case 'dynamite':
                switch (msg.what) {
                    case 'passed':
                        this.discard.append(this.pile.draw(msg.card), msg.card);
                        target.equipped.append(
                            source.equipped.draw(msg.dynamite),
                            msg.dynamite
                        );
                        break;
                    case 'exploded':
                        this.discard.append(this.pile.draw(msg.card), msg.card);
                        this.discard.append(
                            player.equipped.draw(msg.dynamite),
                            msg.dynamite
                        );
                        break;
                }
                break;

            case 'emporio':
                msg.cards.forEach(c => this.emporio.append(this.pile.draw(c), c));
                break;

            case 'reshuffling':
                this.pile.setInfo(msg.pile);
                this.discard.setInfo(msg.discarded);
                break;
        }
    },

    update: function(delta) {

    },

    displayGame: function(game, current) {
        if (!this.game || this.game.identifier !== game.identifier) {
            this.clearGame();
            this.game = game;
        }

        if (game.players) {
            if (this.players) {
                this.players.forEach(player => {
                    player.setInfo(game.players
                        .find(p => p.name === player.info.name));
                });
            } else {
                this.players = [];
                let anglePerPlayer = Math.TWO_PI / game.players.length;

                // Find the shift so that the current player is centered
                let shift = 0;
                if (current) for (; shift < game.players.length; shift++) {
                    if (game.players[shift].name === current.name) break;
                }

                for (let i = game.players.length - 1; i >= 0; i--) {
                    let playerInfo = game.players[i];
                    let player = new Player().setInfo(playerInfo);
                    this.tagGame.appendChild(player.tagRoot);

                    // The angle is shifted by a quarter-circle because we want to
                    // start center-bottom
                    player.angle = (i - shift) * anglePerPlayer + (Math.HALF_PI);
                    player.dirX = Math.cos(player.angle);
                    player.dirY = Math.sin(player.angle);
                    //player.z = (i - shift + game.players.length) * Player.depth;
                    this.players[i] = player;
                }
            }
        }

        if (game.cards) {
            if (!this.pile) {
                this.pile = new Pile('pile');
                this.tagGame.appendChild(this.pile.tagRoot);
            }
            this.pile.setInfo(game.cards.pile);

            if (!this.discard) {
                this.discard = new Pile('discard');
                this.tagGame.appendChild(this.discard.tagRoot);
            }
            this.discard.setInfo(game.cards.discard);
        }

        let what = game.turn
            && game.turn.step
            && game.turn.step.event
            && game.turn.step.event.what;

        if (!this.emporio) {
            this.emporio = new Cards('emporio');
            this.emporio.tagRoot.classList.add('emporio');
            this.tagGame.appendChild(this.emporio.tagRoot);
        }
        if (what === 'emporio') {
            this.emporio.setInfo(game.turn.step.event.cards);
            ui.show(this.emporio);
        } else {
            this.emporio.setInfo();
            ui.hide(this.emporio);
        }

        this.requestPositions();

        if (game.actions) {
            let actions = game.actions;
            if (this.players)
                this.players.forEach(p => p.setActions(actions, this.onAction));

            if (this.pile)
                this.pile.setActions(actions, this.onAction);

            if (this.discard)
                this.discard.setActions(actions, this.onAction);

            if (this.emporio)
                this.emporio.setActions(actions, this.onAction);

            if (game.actions.cancel) ui.show(this.tagCancel);
            else ui.hide(this.tagCancel);
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
        let centerSize = this.pile ? this.pile.tagBottom.offsetHeight * 0.6 : 0;
        if (this.players) this.players.forEach(p => {
            let dirX = p.dirX;
            let dirY = p.dirY;

            let height = p.getHeight();

            let remain = Math.max(Math.sqrt(
                Math.pow(dirX * halfSize.x, 2) +
                Math.pow(dirY * halfSize.y, 2)
            ) - centerSize - height, 0);

            let shift = centerSize + height / 2 + remain * 0.75

            p.move(
                halfSize.x + dirX * shift,
                halfSize.y + dirY * shift,
                p.z, p.angle
            )
        });
        let playersDepth = (this.players ? this.players.length : 0) * Player.depth;

        if (this.pile) this.pile.move(
            halfSize.x + 1.1 * this.pile.getWidth() / 2,
            halfSize.y,
            playersDepth
        );

        if (this.discard) this.discard.move(
            halfSize.x - 1.1 * this.discard.getWidth() / 2,
            halfSize.y,
            playersDepth
        );

        if (this.emporio) this.emporio.move(
            halfSize.x,
            halfSize.y,
            playersDepth + Pile.depth,
            0, 1.1
        );
    }
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);