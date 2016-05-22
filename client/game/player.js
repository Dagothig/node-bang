var ui = require('../ui'),
    misc = require('../misc'),
    Cards = require('./cards'),
    Card = require('./card');

function Player() {
    this.tagRoot = ui.create('div');

    this.infoPlate = ui.create('div', 'info-plate', this.tagRoot);
    this.infoName = ui.create('div', 'name', this.infoPlate);
    this.infoLife = ui.create('div', 'life', this.infoPlate);

    this.equipped = new Cards('equipped');
    this.tagRoot.appendChild(this.equipped.tagRoot);

    this.role = new Card();
    this.tagRoot.appendChild(this.role.tagRoot);

    this.character = new Card();
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

    setInfo: function(playerInfo, turn) {

        this.infoName.innerHTML = playerInfo.name;

        if (playerInfo.hand) {
            this.hand.name = 'hand' + playerInfo.name;
            this.hand.infoFunc = 'setInfo';
            ui.show(this.hand.tagRoot);
        } else if (playerInfo.characters) {
            this.hand.name = 'characters' + playerInfo.name;
            this.hand.infoFunc = 'setCharacter';
            ui.show(this.hand.tagRoot);
        } else ui.hide(this.hand.tagRoot);
        this.hand.setInfo(
            (playerInfo.hand && playerInfo.hand.cards) || playerInfo.characters
        );

        if (playerInfo.equipped) {
            this.equipped.name = 'equipped' + playerInfo.name;
            ui.show(this.equipped.tagRoot);
        } else ui.hide(this.equipped.tagRoot);
        this.equipped.setInfo(playerInfo.equipped);

        if (playerInfo.character)
            this.character.setCharacter(playerInfo.character);
        else
            this.character.setCharacter();

        this.infoLife.innerHTML = '';
        if (playerInfo.life) {
            this.lifeLevel = playerInfo.life;
            for (let i = 0; i < playerInfo.stats.life; i++)
                this.infoLife.innerHTML +=
                    (i < playerInfo.life ? "\uf004" : "\uf08a");
        }

        if (turn && (turn.player === playerInfo.name)) {
            this.infoPlate.classList.add('turn');
        } else {
            this.infoPlate.classList.remove('turn');
        }

        this.role.setRole(playerInfo.role);

        this.info = playerInfo;

        return this;
    },

    setActions: function(acts, onAction) {
        // hand and equipped
        this.hand.setActions(acts, onAction);
        this.equipped.setActions(acts, onAction);

        this.character.unactionable();

        // Check for targetting
        target: if (acts['target']) {
            let args = acts['target'];
            if (args.indexOf(this.info.name) === -1) break target;
            this.character.actionable(() => onAction('target', this.info.name));
        }

        // Check for sid's heal
        choose: if (
            acts['choose'] &&
            acts['choose'].indexOf('heal') !== -1 &&
            this.character.info &&
            this.character.info.name === 'Sid Ketchum'
        ) {
            this.character.actionable(() => onAction('choose', 'heal'));
        }

        return this;
    },

    move: function(x, y, z, angle) {
        this.x = x;
        this.y = y;
        this.z = z;

        let yDirX = Math.cos(angle);
        let yDirY = Math.sin(angle);
        let xDirX = -yDirY;
        let xDirY = yDirX;
        let rotAngle = angle - Math.HALF_PI;

        let xShift = -this.character.getWidth() / 2;
        let cHeight = this.character.getHeight();

        let yInfoShift = cHeight * Player.infoShift;
        ui.move(this.infoPlate,
            this.x +
            yDirX * yInfoShift,

            this.y +
            yDirY * yInfoShift,

            this.z + Player.infoPlateZ
        );
        this.infoPlate.style.marginLeft = (-this.infoPlate.offsetWidth / 2) + 'px';
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
        this.equipped.move(
            this.x +
            yDirX * yEquipShift,

            this.y +
            yDirY * yEquipShift,

            this.z + Player.equippedZ,

            rotAngle
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

        return this;
    },
    getHeight: function() {
        // The division per two is roughly the overlap
        return this.infoPlate.offsetHeight / 2 + this.character.getHeight() * (Player.characterShift - Player.equippedShift + 1);
    }
}

module.exports = Player;