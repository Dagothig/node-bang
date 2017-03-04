var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Cards(name, infoFunc) {
    this.name = name;
    this.infoFunc = infoFunc || 'setInfo';
    this.cards = [];
    this.visible = false;

    this.tagRoot = ui.create('div');

    this._setPosition(0, 0, 0);
}
// Depth is fixed at 10; subject to change
Cards.depth = 10;
Cards.prototype = {
    constructor: Cards,

    setInfo: function(cardsInfo) {
        this.visible = cardsInfo && cardsInfo.length !== undefined;
        this.cards.forEach(card => this.tagRoot.removeChild(card.tagRoot));
        this.cards.length = (this.visible ? cardsInfo.length : cardsInfo)|0;
        for (let i = 0; i < this.cards.length; i++) {
            let card = new Card()[this.infoFunc](this.visible && cardsInfo[i]);
            this.cards[i] = card;
            this.tagRoot.appendChild(card.noTransition().tagRoot);
        }

        return this;
    },
    checkInfo: function(cardsInfo) {
        return (cardsInfo && cardsInfo.length !== undefined) ?
            this.cards.every(card => cardsInfo.find(info => card.is(info))) :
            this.cards.length === cardsInfo;
    },

    setActions: function(acts, onAction) {
        // In the case that we are looking specifically for choosing a card
        if (this.visible && acts['choose']) {
            let args = acts['choose'];
            this.cards.forEach(card => {
                let arg = args.find(id => card.isId(id));
                if (arg) card.actionable(() => onAction('choose', arg));
                else card.unactionable();
            });
        } else {
            let action = null;
            for (let act in acts) {
                if (acts[act].indexOf(this.name) !== -1) {
                    action = act;
                    break;
                }
            }
            let ev = () => onAction(action, this.name);
            if (action) this.cards.forEach(card => card.actionable(ev));
            else this.cards.forEach(card => card.unactionable());
        }

        return this;
    },
    actionable: function(verb, ids, onAction) {
        if (ids.indexOf(this.name) !== -1) this.cards.forEach(card =>
            card.actionable(() => onAction(verb, this.name)));
        else if (this.visible) this.cards.forEach(card => {
            let arg = ids.find(id => card.isId(id));
            if (arg) card.actionable(() => onAction(verb, arg));
            else card.unactionable();
        });

        return this;
    },
    unactionable: function() {
        this.cards.forEach(card => card.unactionable());

        return this;
    },

    move: function(x, y, z, angle, density) {
        return this
            ._setPosition(x, y, z)
            ._rotate(angle, density)
            ._updateCardVisibility();
    },
    arcMove: function(x, y, z, angle, arcAngle, density) {
        return this
            ._setPosition(x, y, z)
            ._arcRotate(angle, arcAngle, density)
            ._updateCardVisibility();
    },

    _setPosition: function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },

    _rotate: function(angle, density) {
        if (this.angle !== angle) {
            this.dirX = Math.cos(angle);
            this.dirY = Math.sin(angle);
        }

        this.angle = angle;
        this.arcAngle = 0;
        this.density = density || 1;

        this.cards.forEach((card, cI) => {
            let shiftedI = (cI - (this.cards.length - 1) / 2) * this.density;
            let offset = shiftedI * card.getWidth();
            card.move(
                this.x + this.dirX * offset,
                this.y + this.dirY * offset,
                this.z + cI,
                angle
            );
        });

        return this;
    },
    _arcRotate: function(angle, arcAngle, density) {
        if (this.angle !== angle) {
            this.dirX = Math.cos(angle + Math.HALF_PI);
            this.dirY = Math.sin(angle + Math.HALF_PI);
        }

        this.angle = angle;
        this.arcAngle = arcAngle;
        this.density = density ||
            (0.7 - this.cards.length / 30) / (this.visible ? 1 : 2);

        let cardSize = {
            x: (this.cards[0] && this.cards[0].getWidth()),
            y: (this.cards[0] && this.cards[0].getHeight()),
        };

        let arcLength = cardSize.x * (this.cards.length - 1);
        let arcRadius = arcLength / this.arcAngle;

        let arcPerCard = this.arcAngle / this.cards.length;
        this.cards.forEach((card, cI) => {
            let shiftedI = (cI - (this.cards.length - 1) / 2) * this.density;
            let arcX = Math.cos(arcPerCard * shiftedI + this.angle - Math.HALF_PI);
            let arcY = Math.sin(arcPerCard * shiftedI + this.angle - Math.HALF_PI);
            card.move(
                this.x +
                this.dirX * arcRadius +
                arcX * arcRadius,

                this.y +
                this.dirY * arcRadius +
                arcY * arcRadius,

                this.z + cI,

                this.angle + arcPerCard * shiftedI
            );
        });

        return this;
    },

    _updateCardVisibility: function() {
        if (this.visible) this.cards.forEach(card => card.visible());
        else this.cards.forEach(card => {
            card.unknown();
            card.info = null;
        });
    },

    getWidth: function() {
        if (!this.cards.length) return 0;
        let cardWidth = this.cards[0].getWidth();
        return cardWidth + cardWidth * (this.cards.length - 1) * this.density;
    },
    getHeight: function() {
        return this.cards.length ? this.cards[0].getHeight() : 0;
    },

    append: function(card) {
        this.cards.push(card);
        this.tagRoot.appendChild(card.tagRoot);
        card.clearMovingTimeout().transitionZ(this.z + this.cards.length + 10000);
        return this;
    },

    draw: function(info) {
        let i = this.cards.findIndex(c => c.is(info));
        if (this.visible && i === -1)
            throw "THE CARD WASN'T FOUND; THIS AIN'T SUPPOSED TO HAPPEN!";
        let card = i === -1 ? this.cards.pop() : this.cards.splice(i, 1)[0];
        card.setPositionToVisiblePosition();
        this.tagRoot.removeChild(card.tagRoot);
        if (info) card.setInfo(info);

        return card.unactionable();
    }
}

module.exports = Cards;