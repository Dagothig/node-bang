var ui = require('../ui'),
    info = require('../../shared/info');

function Card() {
    this.tagRoot = ui.create('div', 'card');
    this.tagRoot.style.fontSize = Card.hoverScale + 'em';
    this.tagRoot.style.transform = 'scale(' + (1/Card.hoverScale) + ')';
    this.tagFace = ui.create('div', 'face', this.tagRoot);
    this.tagFaceName = ui.create('div', 'name', this.tagFace);
    this.tagFaceImage = ui.create('div', 'image', this.tagFace);
    this.tagFaceDescription = ui.create('div', 'description', this.tagFace);
    this.tagFaceType = ui.create('div', 'type', this.tagFace);
    this.tagFaceTypeRank = ui.create('div', 'rank', this.tagFaceType);
    this.tagFaceTypeSuit = ui.create('div', 'suit', this.tagFaceType);

    this.tagBack = ui.create('div', 'back', this.tagRoot);
}
Card.hoverScale = 1.5;
Card.prototype = {
    constructor: Card,

    setInfo: function(cardId) {
        this.tagBack.className = 'back';
        this.tagBack.innerHTML = '';

        if (cardId) {
            let split = cardId.split(':');
            let name = split[0];
            let cardInfo = info.cards[name];
            this.tagFace.className = 'face ' + cardInfo.type;
            this.tagFaceName.innerHTML = cardInfo.name;
            this.tagFaceDescription.innerHTML = cardInfo.description;
            this.tagFaceTypeSuit.className = 'suit ' + split[1];
            this.tagFaceTypeRank.className = 'rank ' + split[2];
        } else {
            this.tagFace.className = 'face';
            this.tagFaceName.innerHTML = '';
            this.tagFaceDescription.innerHTML = '';
            this.tagFaceTypeSuit.className = 'suit';
            this.tagFaceTypeRank.className = 'rank';
        }

        return this;
    },

    setCharacter: function(char) {
        this.tagBack.className = 'back character';
        this.tagBack.innerHTML = '';
        for (let i = 1; i <= 5; i++) ui.create('div', 'bullet-' + i, this.tagBack);

        if (char && char.name) {
            let charInfo = info.characters[char.name];
            this.tagFaceName.innerHTML = char.name;
            this.tagFaceDescription.innerHTML = charInfo.description;
        }

        return this;
    },

    setRole: function(role) {
        this.tagBack.className = 'back role';
        this.tagBack.innerHTML = '';

        if (role && role.name) {
            let roleInfo = info.roles[role.name];
            if (roleInfo) {
                this.visible();
                this.tagFaceName.innerHTML = roleInfo.name;
                this.tagFaceDescription.innerHTML = roleInfo.description
            } else {
                this.unknown();
            }
        }

        return this;
    },

    known: function() {
        this.tagRoot.className = 'card known';
        return this;
    },
    unknown: function() {
        this.tagRoot.className = 'card';
        return this;
    },
    visible: function() {
        this.tagRoot.className = 'card visible';
        return this;
    },

    move: function(x, y, angle) {
        while (angle > Math.PI) angle -= Math.TWO_PI;
        while (angle < -Math.PI) angle += Math.TWO_PI;
        this.tagRoot.style.left = x + 'px';
        this.tagRoot.style.top = y + 'px';
        this.tagRoot.style.fontSize = Card.hoverScale + 'em';
        this.tagRoot.style.transform =
            'scale(' + (1/Card.hoverScale) + ') rotateZ(' + angle + 'rad)';
        return this;
    },

    getWidth: function() {
        return this.tagRoot.offsetWidth / Card.hoverScale;
    },
    getHeight: function() {
        return this.tagRoot.offsetHeight / Card.hoverScale;
    }
};

module.exports = Card;