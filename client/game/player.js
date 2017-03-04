var ui = require('../ui'),
    misc = require('../misc'),
    Cards = require('./cards'),
    Card = require('./card');

function Player() {
    this.tagRoot = ui.create('div');

    this.infoPlate = ui.create('div', 'info-plate', this.tagRoot);
    this.infoPlateContent = ui.create('div', 'content', this.infoPlate);
    this.infoName = ui.create('div', 'name', this.infoPlateContent);
    this.infoLife = ui.create('div', 'life', this.infoPlateContent);

    this.equipped = new Cards('equipped');
    this.tagRoot.appendChild(this.equipped.tagRoot);

    this.role = new Card().noTransition();
    this.tagRoot.appendChild(this.role.tagRoot);

    this.character = new Card().noTransition();
    this.tagRoot.appendChild(this.character.tagRoot);

    this.hand = new Cards('hand');
    this.tagRoot.appendChild(this.hand.tagRoot);

    this.x = this.y = this.z = 0;
}
// The shits are scientifically calculated to be centered
Player.equippedShift = -0.525;
Player.handShift = 0.075;
Player.characterShift = 0.275;
Player.infoShift = 0.775;
// We consider 1 depth per card, 10 per cards for a total of 23
Player.equippedZ = 0;
Player.roleZ = Player.equippedZ + Cards.depth;
Player.characterZ = Player.roleZ + 1;
Player.handZ = Player.characterZ + 1;
Player.infoPlateZ = Player.handZ + Cards.depth;
Player.depth = Player.infoPlateZ + 1;
Player.prototype = {
    constructor: Player,

    computeAnglePortion: function(players, i, shift) {
        if (shift === -1) shift = 0;

        let fullPortion = ((i - shift) / players.length) % 1;
        while (fullPortion < 0) fullPortion++;
        fullPortion *= 4

        // We will define the two angles and the final portion as sitting on behind
        // for integers and approaching ahead when going to the next integer
        // (angle = ahead * portion + behind * (1 - portion))
        let ahead = Math.floor(fullPortion) * Math.HALF_PI + Math.PI;
        let behind = ahead - Math.HALF_PI;
        let portion = fullPortion % 1;

        // Because we will use the exponential on the ratio of width to height to
        // calculate a semblance of a distribution and thus we want to approach the
        // horizontal angles as the ratio rises (and conversely, approach the
        // vertical as it goes to 0), we need to define accordingly

        // For [0,1[, ahead is left and behind is bottom; the portion needs to be
        // flipped. Same for [2,3[ with ahead being right and behind being top
        if (fullPortion < 1 || (fullPortion >= 2 && fullPortion < 3)) {
            this._angleH = ahead;
            this._angleV = behind;
            this._portion = 1 - (portion % 1);
        } else {
            this._angleH = behind;
            this._angleV = ahead;
            this._portion = portion % 1;
        }

        let dist = Math.abs(shift - i);
        dist = Math.min(dist, players.length - dist);
        this.z = (players.length - dist - 1) * Player.depth;
    },
    angle: function(widthToHeightRatio) {
        // Because the exponential is much stronger than what we actually want, we
        // lessen the ratio so that it makes more sense for values around [0.25, 4]
        widthToHeightRatio = widthToHeightRatio * 0.45 + 0.55;
        let portion = Math.pow(this._portion, widthToHeightRatio);
        return this._angleV * portion + this._angleH * (1 - portion);
    },

    setInfo: function(playerInfo, turn) {

        this.infoName.innerHTML = playerInfo.name;

        if (playerInfo.hand && (!this.info || !this.info.hand)) {
            this.hand.name = 'hand';
            this.hand.infoFunc = 'setInfo';
            this.hand.setInfo(playerInfo.hand.cards);
            ui.show(this.hand.tagRoot);
        }
        else if (playerInfo.characters && (!this.info || !this.info.characters)) {
            this.hand.name = 'characters';
            this.hand.infoFunc = 'setCharacter';
            this.hand.setInfo(playerInfo.characters);
            ui.show(this.hand.tagRoot);
        }
        else if (!playerInfo.hand && !playerInfo.characters)
            ui.hide(this.hand.tagRoot);

        if (playerInfo.equipped && (!this.info || !this.info.equipped)) {
            this.equipped.name = 'equipped';
            this.equipped.setInfo(playerInfo.equipped);
            ui.show(this.equipped.tagRoot);
        } else if(!playerInfo.equipped) ui.hide(this.equipped.tagRoot);

        let infoLifeHTML = '';
        if (playerInfo.stats && playerInfo.stats.life) {
            ui.show(this.infoLife);
            this.lifeLevel = playerInfo.life;
            for (let i = 0; i < playerInfo.stats.life; i++)
                infoLifeHTML += i < playerInfo.life ? "\uf004" : "<em>\uf004</em>";
        } else {
            ui.hide(this.infoLife);
        }
        this.infoLife.innerHTML = infoLifeHTML;

        if (turn && (turn.player === playerInfo.name)) {
            this.infoPlate.classList.add('turn');
        } else {
            this.infoPlate.classList.remove('turn');
        }

        if (playerInfo.winner) {
            this.tagRoot.classList.add('winner');
        } else {
            this.tagRoot.classList.remove('winner');
        }

        this.character.setCharacter(playerInfo.character);
        this.role.setRole(playerInfo.role);

        this.info = playerInfo;

        return this;
    },
    checkInfo: function(playerInfo) {
        return {
            hand: !playerInfo.hand
                || this.hand.checkInfo(playerInfo.hand.cards),
            characters: !playerInfo.characters
                || this.hand.checkInfo(playerInfo.characters),
            equipped: !playerInfo.equipped
                || this.equipped.checkInfo(playerInfo.equipped),
            character: this.character.is(playerInfo.character),
            role: this.role.is(playerInfo.role)
        };
    },

    setActions: function(acts, onAction) {
        this.hand.unactionable();
        this.equipped.unactionable();
        for (var verb in acts) {
            if (!verb.endsWith(this.info.name) && verb !== 'choose') continue;
            this.hand.actionable(verb, acts[verb], onAction);
            this.equipped.actionable(verb, acts[verb], onAction);
            break;
        };

        // Check for targetting
        this.character.unactionable();
        target: if (acts['target']) {
            let args = acts['target'];
            if (args.indexOf(this.info.name) === -1) break target;
            this.character.actionable(() => onAction('target', this.info.name));
        }

        // Check for sid's heal
        if (
            acts['choose'] &&
            acts['choose'].indexOf('heal') !== -1 &&
            this.character.info &&
            this.character.info.name === 'Sid Ketchum'
        ) {
            this.character.actionable(() => onAction('choose', 'heal'));
        }

        return this;
    },

    endPhaseMove: function(x, y) {
        this.x = x;
        this.y = y;
        this.z = 0;

        let width = this.character.getWidth();
        let height = this.character.getHeight();

        ui.move(this.infoPlate,
            this.x,
            this.y + height / 2,
            this.z + Player.infoPlateZ
        );
        this.infoPlate.style.transform = '';

        this.character.move(
            this.x - width/3,
            this.y,
            this.z + Player.characterZ,
            -0.1
        ).visible();

        this.role.move(
            this.x + width/3,
            this.y,
            this.z + Player.roleZ,
            0.1
        ).visible();
    },

    move: function(x, y, z, angle, dirX, dirY) {
        this.x = x;
        this.y = y;
        this.z = z;

        let yDirX = dirX;
        let yDirY = dirY;
        let xDirX = -yDirY;
        let xDirY = yDirX;
        let rotAngle = angle - Math.HALF_PI;

        let xShift = -this.character.getWidth() / 2;
        let cHeight = this.character.getHeight();
        let yInfoShift = cHeight * Player.infoShift;
        let infoPlateX = this.x + yDirX * yInfoShift;
        ui.move(this.infoPlate,
            this.x +
            yDirX * yInfoShift,

            this.y +
            yDirY * yInfoShift,

            this.z + Player.infoPlateZ
        );
        this.infoPlate.style.transform = 'rotateZ(' + rotAngle + 'rad)';

        let yHandShift = cHeight * Player.handShift;
        this.hand.arcMove(
            this.x +
            xDirX * xShift +
            yDirX * yHandShift,

            this.y +
            xDirY * xShift +
            yDirY * yHandShift,

            this.z + Player.handZ,

            rotAngle,
            Math.QUARTER_PI
        );

        let yEquipShift = cHeight * Player.equippedShift;
        this.equipped.arcMove(
            this.x +
            yDirX * yEquipShift,

            this.y +
            yDirY * yEquipShift,

            this.z + Player.equippedZ,

            rotAngle,
            Math.EIGTH_PI,
            (1 - this.equipped.cards.length / 60)
        );

        let xStatShift =
            this.hand.getWidth() * 0.5 +
            this.character.getWidth() * 0.25;
        let yStatShift = cHeight * Player.characterShift;

        this.character.move(
            this.x +
            xDirX * (xShift + xStatShift) +
            yDirX * yStatShift,

            this.y +
            xDirY * (xShift + xStatShift) +
            yDirY * yStatShift,

            this.z + Player.characterZ,

            rotAngle
        );
        if (this.info.character) this.character.visible();
        else this.character.unknown();

        let xRoleShift = this.role.getWidth() * 0.1;
        let yRoleShift = -cHeight * 0.2;

        // The role is the card the most un
        this.role.move(
            this.x +
            xDirX * (xShift + xStatShift + xRoleShift) +
            yDirX * (yStatShift + yRoleShift),

            this.y +
            xDirY * (xShift + xStatShift + xRoleShift) +
            yDirY * (yStatShift + yRoleShift),

            this.z + Player.roleZ,

            rotAngle
        );
        if (this.info.role && this.info.role.name !== 'Unknown')
            this.role.visible();
        else this.role.unknown();

        return this;
    },
    getHeight: function() {
        // The division per two is roughly the overlap
        return this.character.getHeight() *
                (Player.characterShift - Player.equippedShift + 1 + 0.2);
    },

    shake: function() {
        ui.shake(this.tagRoot);
    }
}

module.exports = Player;