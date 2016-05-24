var ui = require('./ui'),
    misc = require('./misc'),
    Card = require('./game/card'),
    Cards = require('./game/cards'),
    Pile = require('./game/pile'),
    Player = require('./game/player'),
    Decal = require('./game/decal');

function Game(settings, onAction) {
    this.onAction = onAction;
    this.tagRoot = ui.one('#game');
    this.tagGame = ui.one(this.tagRoot, '.container');
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
            ui.show(this.tagRoot);
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
        this.decal = null;
        this.choice = null;
    },

    handleEvent: function(msg) {
        if (!this.game) return;

        let player = msg.player &&
            this.players.find(p => p.info.name === msg.player);
        let target = msg.target &&
            this.players.find(p => p.info.name === msg.target);
        let func = null, source = null;
        switch (msg.name) {
            case 'draw':
                func = arg => player.hand.append(source.draw(arg), arg);
                source = (msg.from === 'pile' ? this.pile :
                    (msg.from === 'discard' ? this.discard :
                    (msg.from === 'hand' ? target.hand :
                    (msg.from === 'equipped' ? target.equipped :
                    (msg.from === 'choice' ? this.choice :
                    null)))));

                if (msg.amount) for (let i = 0; i < msg.amount; i++) func();
                else if (msg.card) func(msg.card);
                else if (msg.cards) msg.cards.forEach(c => func(c));
                break;

            case 'discard':
                func = arg => this.discard.append(source.draw(arg), arg);
                source = (player ? player[msg.from] :
                    (msg.from === 'pile' ? this.pile :
                    (msg.from === 'choice' ? this.choice :
                    null)));

                if (msg.amount) for (let i = 0; i < msg.amount; i++) func();
                else if (msg.card) func(msg.card);
                else if (msg.cards) msg.cards.forEach(c => func(c));

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

            case 'prigione':
            case 'barile':
                switch(msg.what) {
                    case 'released':
                    case 'imprisoned':
                    case 'avoid':
                    case 'fail':
                        this.discard.append(this.pile.draw(msg.card), msg.card);
                        break;
                }
                break;

            case 'choice':
                msg.cards.forEach(c => this.choice.append(this.pile.draw(c), c));
                break;

            case 'reshuffling':
                this.pile.setInfo(msg.pile);
                this.discard.setInfo(msg.discarded);
                break;
        }
    },

    update: function(delta) {

    },

    angleFor: function(i, playerCount) {
        let portion = i / playerCount;
        while (portion > 0.5) portion = portion - 1;
        if (portion !== 0) portion = Math.sign(portion) * 0.025 + portion * 0.95;
        return portion * Math.TWO_PI;
    },
    displayGame: function(game, current) {
        if (!this.game || this.game.identifier !== game.identifier) {
            this.clearGame();
            this.game = game;
        }

        if (game.players) {
            if (this.players) {
                this.players.forEach(player => player.setInfo(
                    game.players.find(p => p.name === player.info.name),
                    game.turn
                ));
            } else {
                this.players = [];

                // Find the shift so that the current player is centered
                let shift = null;
                if (current) for (let i = 0; i < game.players.length; i++) {
                    if (game.players[i].name === current.name) {
                        shift = i;
                        break;
                    }
                }

                for (let i = game.players.length - 1; i >= 0; i--) {
                    let playerInfo = game.players[i];
                    let player = new Player().setInfo(playerInfo, game.turn);
                    this.tagGame.appendChild(player.tagRoot);

                    // The angle is shifted by a quarter-circle because we want to
                    // start center-bottom
                    player.angle = shift !== null ?
                        this.angleFor(i - shift, game.players.length) :
                        i * Math.TWO_PI / game.players.length;
                    player.angle += Math.HALF_PI;
                    player.dirX = Math.cos(player.angle);
                    player.dirY = Math.sin(player.angle);
                    let dist = Math.abs(shift - i);
                    dist = Math.min(dist, game.players.length - dist);
                    player.z = (game.players.length - dist - 1) * Player.depth;
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

        if (!this.decal) {
            this.decal = new Decal();
            this.tagGame.appendChild(this.decal.tagRoot);
        }
        this.decal.setInfo(game);

        let what = game.turn
            && game.turn.step
            && game.turn.step.event
            && game.turn.step.event.what;

        if (!this.choice) {
            this.choice = new Cards('choice');
            this.choice.tagRoot.classList.add('choice');
            this.tagGame.appendChild(this.choice.tagRoot);
        }
        if (what === 'choice') {
            this.choice.setInfo(game.turn.step.event.cards);
            ui.show(this.choice);
        } else {
            this.choice.setInfo();
            ui.hide(this.choice);
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

            if (this.choice)
                this.choice.setActions(actions, this.onAction);

            if (game.actions.cancel) ui.show(this.tagCancel);
            else ui.hide(this.tagCancel);
        }
    },

    requestPositions: function() {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(this.resizeFunc, this.resizeTime);
    },
    updatePositions: function() {
        let count = this.players ? this.players.length : 0;
        this.tagGame.style.minWidth =
            this.tagGame.style.minHeight =
            (30 + 2 * count) + 'em';
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

            let shift = centerSize + height / 2 + remain * 0.9;

            p.move(
                halfSize.x + dirX * shift,
                halfSize.y + dirY * shift,
                p.z, p.angle
            );
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

        if (this.decal) this.decal.move(playersDepth + Pile.depth);

        if (this.choice) this.choice.move(
            halfSize.x,
            halfSize.y,
            playersDepth + Pile.depth + Decal.depth,
            0, 1.1
        );
    }
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);