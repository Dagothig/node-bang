var ui = require('../ui'),
    info = require('./info');

function Card() {
    this.tagRoot = ui.create('div', 'card');
    this.tagRoot.style.fontSize = Card.hoverScale + 'em';
    this.tagFace = ui.create('div', 'face', this.tagRoot);
    this.tagFaceName = ui.create('div', 'name', this.tagFace);
    this.tagFaceImage = ui.create('div', 'image', this.tagFace);
    this.tagFaceContent = ui.create('div', 'content', this.tagFace);
    this.tagFaceDescription = ui.create('div', 'description', this.tagFaceContent);
    this.tagFaceDraw = ui.create('div', 'draw', this.tagFaceContent);
    this.tagFaceRange = ui.create('div', 'range', this.tagFaceContent);
    this.tagFaceType = ui.create('div', 'type', this.tagFace);
    this.tagFaceTypeRank = ui.create('div', 'rank', this.tagFaceType);
    this.tagFaceTypeSuit = ui.create('div', 'suit', this.tagFaceType);
    this.tagBack = ui.create('div', 'back', this.tagRoot);

    this.movingTimeout = null;
    this.onMoveFinish = () => {
        this.movingTimeout = null;
        if (this.tempZ !== null) {
            this.tagRoot.style.zIndex = this.z;
            this.tempZ = null;
        }
        this.tagRoot.classList.remove('moving', 'no-transition');
    };

    this.tempZ = null;
    this.isVisible = false;
    this.move(0, 0, 0, 0);
}
Card.hoverScale = 1.5;
Card.transitionTime = 500;
Card.clearSizeCache = () => Card.width = Card.height = null;
Card.prototype = {
    constructor: Card,

    is: function(info) {
        return (this.info && info) ? (
            (info.name && info.name === this.info.name) ||
            (info.id && info.id === this.info.id)
        ) : (!this.info && !info);
    },

    isId: function(id) {
        return this.info ?
            ((this.info.name || this.info.id) === id) :
            (!this.info && !id);
    },

    setInfo: function(card) {
        this.setType('info');
        if (this.is(card)) return this;

        this.info = card;
        if (this.info && this.info.id) {
            let split = this.info.id.split(':');
            let name = split[0];
            let cardInfo = info.cards[name];

            this.tagFace.className = 'face ' + cardInfo.type;
            this.tagFaceName.innerHTML = cardInfo.name;
            this.setImage(name);
            this.tagFaceDescription.innerHTML = cardInfo.description || '';

            if (cardInfo.range) {
                ui.show(this.tagFaceRange);
                this.tagFaceRange.innerHTML = cardInfo.range;
            }
            else ui.hide(this.tagFaceRange);

            if (cardInfo.draw) {
                ui.show(this.tagFaceDraw);
                this.tagFaceDraw.innerHTML = cardInfo.draw + 'x';
            }
            else ui.hide(this.tagFaceDraw);

            this.tagFaceTypeSuit.className = 'suit ' + split[1];
            this.tagFaceTypeRank.className = 'rank ' + split[2];
        } else {
            this.tagFace.className = 'face';
            this.tagFaceName.innerHTML = '';
            this.setImage();
            this.tagFaceDescription.innerHTML = '';

            ui.hide(this.tagFaceRange, this.tagFaceDraw);

            this.tagFaceTypeSuit.className = 'suit';
            this.tagFaceTypeRank.className = 'rank';
        }

        return this;
    },

    setCharacter: function(char) {
        this.setType('character');
        if (this.is(char)) return this;

        ui.hide(this.tagFaceRange, this.tagFaceDraw);
        this.info = char;

        if (char && char.name && info.characters[char.name]) {
            let charInfo = info.characters[char.name];
            this.tagFaceName.innerHTML = char.name;
            this.tagFaceDescription.innerHTML = charInfo.description;
            this.setImage(char.name);
            return this;
        }

        this.setImage();
        return this;
    },

    setRole: function(role) {
        this.setType('role');
        if (this.is(role)) return this;

        ui.hide(this.tagFaceRange, this.tagFaceDraw);
        this.info = role;

        if (role && role.name && info.roles[role.name]) {
            let roleInfo = info.roles[role.name];
            this.tagFaceName.innerHTML = roleInfo.name;
            this.tagFaceDescription.innerHTML = roleInfo.description;
            this.setImage(role.name);
            return this;
        }

        this.setImage();
        return this;
    },

    setImage: function(img) {
        let imgName = img ? img.replace(/\s/g, '-').toLowerCase() : '';
        this.tagFaceImage.className = 'image ' + imgName;
    },

    setType: function(type) {
        if (this.type === type) return;
        this.tagRoot.classList.remove('character', 'role');
        this.tagBack.innerHTML = '';
        switch (this.type = type) {
            case 'info':
                break;
            case 'character':
                for (let i = 1; i <= 5; i++)
                    ui.create('div', 'bullet-' + i, this.tagBack);
                this.tagRoot.classList.add('character');
                break;
            case 'role':
                this.tagRoot.classList.add('role');
                break;
        }
    },

    actionable: function(onAction) {
        this.tagRoot.classList.add('actionable');
        this.tagRoot.onclick = onAction;
        return this;
    },
    unactionable: function() {
        this.tagRoot.classList.remove('actionable');
        this.tagRoot.onclick = null;
        return this;
    },
    unknown: function() {
        if (!this.isVisible) return this;
        this.isVisible = false;
        this.tagRoot.classList.remove('visible');
        return this;
    },
    visible: function() {
        if (this.isVisible) return this;
        this.isVisible = true;
        this.tagRoot.classList.add('visible');
        return this;
    },

    move: function(x, y, z, angle) {
        angle = (angle !== undefined && angle !== null) ? angle : this.angle;
        x = Math.round(x);
        y = Math.round(y);
        z = Math.round(z);

        if (x === this.x && y === this.y && z === this.z && angle === this.angle)
            return this;

        this.tagRoot.classList.add('moving');
        if (this.x !== x) this.tagRoot.style.left = (this.x = x) + 'px';
        if (this.y !== y) this.tagRoot.style.top = (this.y = y) + 'px';
        if (this.z !== z) {
            this.z = z;
            if (this.tempZ === null) this.tagRoot.style.zIndex = z;
        }
        if (this.angle !== angle)
            this.tagRoot.style.transform =
                'scale(' + (1/Card.hoverScale) + ') ' +
                'rotateZ(' + (this.angle = angle) + 'rad) ';
        if (this.movingTimeout) clearTimeout(this.movingTimeout);
        this.movingTimeout = setTimeout(this.onMoveFinish, Card.transitionTime);

        return this;
    },
    transitionZ: function(z) {
        this.tagRoot.style.zIndex = this.tempZ = z;
        return this;
    },
    noTransition: function() {
        this.tagRoot.classList.add('no-transition');
        return this;
    },
    clearMovingTimeout: function() {
        if (this.movingTimeout) {
            clearTimeout(this.movingTimeout);
            this.movingTimeout = null;
        }
        return this;
    },
    setPositionToVisiblePosition: function() {
        this.tagRoot.style.left =
            this.tagRoot.offsetLeft + this.tagRoot.offsetWidth/2 + 'px';
        this.tagRoot.style.top =
            this.tagRoot.offsetTop + this.tagRoot.offsetHeight/2 + 'px';
        return this;
    },

    getWidth: function() {
        return Card.width ? Card.width :
            (Card.width = this.tagRoot.offsetWidth / Card.hoverScale);
        },
    getHeight: function() {
        return Card.height ? Card.height :
            (Card.height = this.tagRoot.offsetHeight / Card.hoverScale);
    }
};

module.exports = Card;