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

    computeAngle: function(players, i, shift) {
        // The angle is shifted by a quarter-circle because we want to
        // start center-bottom
        this.angle = (shift !== -1 ?
                this.angleFor(i - shift, players.length) :
                i * Math.TWO_PI / players.length
            ) + Math.HALF_PI;
        this.dirX = Math.cos(this.angle);
        this.dirY = Math.sin(this.angle);
        let dist = Math.abs(shift - i);
        dist = Math.min(dist, players.length - dist);
        this.z = (players.length - dist - 1) * Player.depth;
    },
    angleFor: function(i, playerCount) {
        let portion = i / playerCount;
        while (portion > 0.5) portion = portion - 1;
        if (portion !== 0) portion = Math.sign(portion) * 0.025 + portion * 0.95;
        return portion * Math.TWO_PI;
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

        if (playerInfo.character)
            this.character.setCharacter(playerInfo.character);
        else
            this.character.setCharacter();

        this.infoLife.innerHTML = '';
        if (playerInfo.stats && playerInfo.stats.life) {
            ui.show(this.infoLife);
            this.lifeLevel = playerInfo.life;
            for (let i = 0; i < playerInfo.stats.life; i++)
                this.infoLife.innerHTML +=
                    (i < playerInfo.life ? "\uf004" : "\uf08a");
        } else {
            ui.hide(this.infoLife);
        }

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

        this.role.setRole(playerInfo.role);

        this.info = playerInfo;

        return this;
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
        this.z = this.dirX = this.dirY = this.angle = 0;

        let width = this.character.getWidth();
        let height = this.character.getHeight();

        ui.move(this.infoPlate,
            this.x,
            this.y + height / 2 + this.infoPlate.offsetHeight/2,
            this.z + Player.infoPlateZ
        );
        this.infoPlate.style.marginLeft = (-this.infoPlate.offsetWidth / 2) + 'px';
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
        let infoPlateX = this.x + yDirX * yInfoShift;
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
        if (this.info.role && this.info.role.name !== 'Unknown') this.role.visible();
        else this.role.unknown();

        return this;
    },
    getHeight: function() {
        // The division per two is roughly the overlap
        return this.infoPlate.offsetHeight / 2 + this.character.getHeight() * (Player.characterShift - Player.equippedShift + 1);
    },

    shake: function() {
        ui.shake(this.tagRoot);
    }
}

module.exports = Player;