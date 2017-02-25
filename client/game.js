var ui = require('./ui'),
    misc = require('./misc'),
    Card = require('./game/card'),
    Cards = require('./game/cards'),
    Pile = require('./game/pile'),
    Player = require('./game/player'),
    Decal = require('./game/decal'),
    info = require('./game/info');

function Game(settings, onAction) {
    let self = this;

    this.onAction = onAction;
    this.settings = settings;
    this.tagRoot = ui.one('#game');
    this.tagGame = ui.one(this.tagRoot, '.container');
    this.tagButtons = ui.create('div', 'buttons absolute bottom left');
    this.tagResign = ui.create('input', {
        type: 'button', value: 'Resign', name: 'resign',
        onclick: () => confirm('Are you sure you want to resign?') &&
            self.onAction('resign', 'resign')
    }, this.tagButtons);
    this.tagCancel = ui.create('input', {
        className: 'flash', type: 'button', value: 'Cancel', name: 'cancel',
        onclick: () => {
            ui.hide(self.tagCancel);
            self.onAction('cancel', self.tagCancel.value);
        }
    }, this.tagButtons);

    ui.hide(this.tagResign, this.tagCancel);

    this.clearGame();

    window.addEventListener('resize', ev => this.requestPositions());
    this.resizeTime = 100;
    this.resizeFunc = () => {
        this.resizeTimeout = null;
        this.tagRoot.classList.remove('new');
        this.updatePositions();
    };
    this.resizeTimeout = null;
}
Game.prototype = {
    constructor: Game,

    handleGame: function(game, current) {
        if (game) this.displayGame(game, current);
        else if (this.game) this.clearGame();
    },

    clearGame: function() {
        this.tagGame.innerHTML = '';
        this.tagGame.appendChild(this.tagButtons);

        this.game = null;
        this.players = null;
        this.pile = null;
        this.discard = null;
        this.decal = null;
        this.choice = null;
    },

    handleEvent: function(msg) {
        if (!this.game || !msg) return;

        let player = msg.player &&
            this.players.find(p => p.info.name === msg.player);
        let target = msg.target &&
            this.players.find(p => p.info.name === msg.target);
        let func = null, drawTarget = null, source = null;
        switch (msg.name) {
            case 'draw':
            case 'pile':
            case 'discard':
                target = target || player;

                drawTarget =
                    (msg.name === 'draw' ? player.hand :
                    (msg.name === 'pile' ? this.pile :
                    (msg.name === 'discard' ? this.discard :
                    null)));

                source =
                    (msg.from === 'pile' ? this.pile :
                    (msg.from === 'discard' ? this.discard :
                    (msg.from === 'hand' ? target.hand :
                    (msg.from === 'equipped' ? target.equipped :
                    (msg.from === 'choice' ? this.choice :
                    null)))));

                func = arg => drawTarget.append(source.draw(arg), arg);

                if (msg.amount) for (let i = 0; i < msg.amount; i++) func();
                else if (msg.card) func(msg.card);
                else if (msg.cards) msg.cards.forEach(c => func(c));
                break;

            case 'equipped':
                target.equipped.append(player.hand.draw(msg.card), msg.card);
                break;

            case 'dynamite':
                switch (msg.what) {
                    case 'passed':
                        this.discard.append(this.pile.draw(msg.card), msg.card);
                        source = this.players.find(p => p.info.name === msg.source);
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
                this.choice.visible = true;
                msg.cards.forEach(c => this.choice.append(this.pile.draw(c), c));
                break;

            case 'damage':
                target.shake();
                break;

            case 'reshuffling':
                for (var i = this.discard.pending.length; i--;)
                    this.pile.append(this.discard.draw());
                this.pile.fullSize = msg.pile;
                this.discard.setInfo([]);
                break;
        }
    },

    displayGame: function(game, current) {
        let newGame = false;
        if (!this.game || this.game.identifier !== game.identifier) {
            this.clearGame();
            newGame = true;
        }
        this.game = game;

        if (game.phase === 'End') return this.displayEnd(game, newGame);

        if (game.players) {
            let calculateAngles = false;
            if (this.players) {
                for (let i = 0; i < this.players.length; i++) {
                    let player = this.players[i];
                    let info = game.players.find(p =>
                        p.name === player.info.name);
                    if (info) {
                        if (info.role && !player.info.role)
                            calculateAngles = true;
                        player.setInfo(info, game.turn);
                    } else {
                        calculateAngles = true;
                        this.tagGame.removeChild(player.tagRoot);
                        this.players.splice(i, 1);
                        i--;
                        continue;
                    }
                }
            } else {
                this.players = [];
                calculateAngles = true;
                for (let i = game.players.length - 1; i >= 0; i--) {
                    let playerInfo = game.players[i];
                    let player = new Player().setInfo(playerInfo, game.turn);
                    this.tagGame.appendChild(player.tagRoot);
                    this.players[i] = player;
                }
            }

            if (calculateAngles) {

                // Find the shift so that the current player is centered
                let shift = current ?
                    this.players.findIndex(p =>
                        p.info.name === current.name) : -1;
                if (shift === -1)
                    shift = this.players.findIndex(p =>
                        p.info.role && p.info.role.name === 'Sheriff');

                this.players.forEach((player, i) =>
                    player.computeAngle(game.players, i, shift));

            }
        }

        if (game.cards && !this.pile) {
            this.pile = new Pile('pile');
            this.tagGame.appendChild(this.pile.tagRoot);
            this.pile.setInfo(game.cards.pile);

            this.discard = new Pile('discard');
            this.tagGame.appendChild(this.discard.tagRoot);
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
            if (this.choice.cards.length !== game.turn.step.event.cards.length)
                this.choice.setInfo(game.turn.step.event.cards);
            ui.show(this.choice);
        } else {
            this.choice.setInfo();
            ui.hide(this.choice);
        }

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

            if (game.actions.cancel) {
                this.tagCancel.value = game.actions.cancel[0];
                ui.show(this.tagCancel);
            } else ui.hide(this.tagCancel);
        }

        let player = this.players.find(player =>
            player.info.name === current.name);
        if (player && !player.info.disconnected) ui.show(this.tagResign);
        else ui.hide(this.tagResign);

        if (newGame) this.tagRoot.classList.add('new');
        this.requestPositions();
    },
    displayEnd: function(game, newGame) {
        ['pile', 'discard', 'decal', 'choice']
            .filter(k => this[k])
            .forEach(k => {
                let obj = this[k];
                this.tagGame.removeChild(obj.tagRoot);
                this[k] = null;
            });

        if (game.players) {
            if (this.players) {
                this.players.forEach(player => player.setInfo(
                    game.players.find(p => p.name === player.info.name),
                    game.turn
                ));
            } else {
                this.players = game.players.map(playerInfo => {
                    let player = new Player().setInfo(playerInfo);
                    this.tagGame.appendChild(player.tagRoot);
                    return player;
                });
            }
        }

        if (game.actions && game.actions.cancel) {
            this.tagCancel.value = game.actions.cancel[0];
            ui.show(this.tagCancel);
        } else ui.hide(this.tagCancel);

        ui.hide(this.tagResign);

        if (!newGame) this.requestPositions();
        else this.updatePositions();
    },

    requestPositions: function() {
        if (this.resizeTimeout) return;
        this.resizeTimeout = setTimeout(this.resizeFunc, this.resizeTime);
    },
    updatePositions: function() {
        let count = this.players ? this.players.length : 0;
        if (this.pile) {
            this.tagGame.style.minWidth =
                this.players[0].getHeight() * 2.1 +
                    this.pile.tagBottom.offsetWidth * 2.4 + 'px';
            this.tagGame.style.minHeight =
                this.players[0].getHeight() * 2.1 +
                    this.pile.tagBottom.offsetHeight * 1.2 + 'px';
        } else
            this.tagGame.style.minHeight = this.tagGame.style.minWidth = '0em';
        let halfSize = {
            x: this.tagGame.offsetWidth / 2,
            y: this.tagGame.offsetHeight / 2
        };
        let centerSize = this.pile ? this.pile.tagBottom.offsetHeight * 0.6 : 0;

        if (this.players) this.players.forEach((p, i) => {
            if (this.game.phase === 'End') {
                let nwidth = Math.ceil(Math.sqrt(this.players.length));
                let x = (i%nwidth - (nwidth-1)/2) * 1.25;
                let y = (Math.floor(i/nwidth) - (nwidth-1)/2) * 1.25;
                let width = p.character.getWidth() + p.role.getWidth();
                let height = p.character.getHeight() + p.infoPlate.offsetHeight;
                p.endPhaseMove(halfSize.x + x * width, halfSize.y + y * height);
                return;
            }

            let dirX = p.dirX;
            let dirY = p.dirY;

            let height = p.getHeight();

            let remain = Math.max(Math.sqrt(
                Math.pow(dirX * halfSize.x, 2) +
                Math.pow(dirY * halfSize.y, 2)
            ) - centerSize - height, 0);

            let shift = centerSize + height / 2 + remain * 0.75;

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

        if (this.choice) {
            this.choice.move(
                halfSize.x,
                halfSize.y - this.choice.getHeight() * 0.1,
                playersDepth + Pile.depth + Decal.depth,
                0, 1.1
            );
        }
    },

    checkInfo: function(msg) {
        let what = msg.turn
            && msg.turn.step
            && msg.turn.step.event
            && msg.turn.step.event.what;
        return {
            players: this.players.reduce((ps, p) => {
                let info = msg.players.find(i => p.info.name === i.name);
                ps[info.name] = p.checkInfo(info);
                return ps;
            }, {}),
            choice: (what !== 'choice'
                || this.choice.checkInfo(msg.turn.step.event.cards)),
            pile: (!msg.cards
                || !msg.cards.pile
                || this.pile.checkInfo(msg.cards.pile)),
            discard: (!msg.cards
                || !msg.cards.discard
                || this.discard.checkInfo(msg.cards.discard))
        };
    }
};

module.exports = (onJoin, onAction) => new Game(onJoin, onAction);