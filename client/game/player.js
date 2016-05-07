var ui = require('../ui'),
    misc = require('../misc'),
    Cards = require('./cards'),
    Card = require('./card');

function Player() {
    this.tagRoot = ui.create('div', 'relative');

    this.role = new Card();
    this.tagRoot.appendChild(this.role.tagRoot);

    this.character = new Card();
    this.tagRoot.appendChild(this.character.tagRoot);

    this.equipment = new Cards();
    this.tagRoot.appendChild(this.equipment.tagRoot);

    this.hand = new Cards();
    this.tagRoot.appendChild(this.hand.tagRoot);
}
Player.equipmentOverlap = 0.4;
Player.prototype = {
    constructor: Player,

    setInfo: function(playerInfo) {
        if (playerInfo.hand) {
            this.hand.setInfo(playerInfo.hand.cards);
            ui.show(this.hand.tagRoot);
        } else ui.hide(this.hand.tagRoot);

        if (playerInfo.equipment) {
            this.equipment.setInfo(playerInfo.equipment);
            ui.show(this.equipment.tagRoot);
        } else ui.hide(this.equipment.tagRoot);

        if (playerInfo.character) {
            this.character.setCharacter(playerInfo.character).known();
            ui.show(this.character.tagRoot);
        } else ui.hide(this.character.tagRoot);

        if (playerInfo.role) {
            this.role.setRole(playerInfo.role);
            ui.show(this.role.tagRoot);
        } else ui.hide(this.role.tagRoot);

        return this;
    },

    move: function(x, y) {
        this.tagRoot.style.left = x + 'px';
        this.tagRoot.style.top = y + 'px';

        return this;
    },
    rotate: function(angle) {
        let yDirX = Math.cos(angle);
        let yDirY = Math.sin(angle);
        let xDirX = -yDirY;
        let xDirY = yDirX;
        angle -= Math.HALF_PI;

        let xShift = -this.character.getWidth();
        let handDensity = this.hand.visible ? 0.6 : 0.3;

        this.hand.arcRotate(angle, Math.QUARTER_PI, handDensity);
        this.equipment.rotate(angle);

        this.hand.move(
            xDirX * xShift,
            xDirY * xShift
        );

        let equipShift = this.equipment.getHeight() * (Player.equipmentOverlap - 1);
        this.equipment.move(
            xDirX * xShift + yDirX * equipShift,
            xDirY * xShift + yDirY * equipShift
        );

        let statXShift = this.hand.getWidth() * 0.4 +
            this.character.getWidth() * 0.5;
        let statYShift = this.character.getHeight() * 0.4;
        let roleShift = -this.role.getHeight() * 0.2;

        this.character.move(
            xDirX * (xShift + statXShift) + yDirX * statYShift,
            xDirY * (xShift + statXShift) + yDirY * statYShift,
            angle
        );

        this.role.move(
            xDirX * (xShift + statXShift * 1.1) + yDirX * (statYShift + roleShift),
            xDirY * (xShift + statXShift * 1.1) + yDirY * (statYShift + roleShift),
            angle
        );

        return this;
    },
    getHeight: function() {
        return this.hand.getHeight() +
            this.equipment.getHeight() * (1 - Player.equipmentOverlap) +
            this.character.getHeight() * 0.4;
    }
}

module.exports = Player;