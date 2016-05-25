var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Pile(name) {
    this.name = name;
    this.size = 0;

    this.tagRoot = ui.create('div', 'card-pile');
    this.tagBottom = ui.create('div', 'bottom', this.tagRoot);
    this.tagSize = ui.create('div', 'size', this.tagRoot);
    this.topCard = new Card();
    this.topCard.tagRoot.classList.add('top');
    this.tagRoot.appendChild(this.topCard.tagRoot);

    this.pendingCards = [];
    this.pendingInfo = null;

    this.move(0, 0, 0);
}
Pile.bottomZ = 0;
Pile.sizeZ = Pile.bottomZ + 1;
Pile.topCardZ = Pile.sizeZ + 100;
Pile.depth = Pile.topCardZ + 1;
Pile.prototype = {
    constructor: Pile,

    setInfo: function(cardsInfo) {
        if (this.pendingCards.length) {
            this.pendingInfo = cardsInfo;
            return this;
        }
        this.info = cardsInfo;

        this._updateToInfo();
        this._updateToSize();

        return this;
    },

    actionable: function(onAction, action, arg) {
        if (this.size > 0)  {
            this.topCard.actionable(() => {
                onAction(action, arg);
                this.topCard.unactionable();
            });
        } else {
            this.tagBottom.classList.add('actionable');
            this.tagBottom.onclick = () => {
                this.tagBottom.classList.remove('actionable');
                this.tagBottom.onclick = null;
                onAction(action, arg);
            }
        }
        return this;
    },
    unactionable: function() {
        this.topCard.unactionable();
        this.tagBottom.classList.remove('actionable');
        this.tagBottom.onclick = null;
        return this;
    },
    setActions: function(actions, onAction) {
        let action = null;
        for (let act in actions) {
            if (actions[act].indexOf(this.name) !== -1) {
                action = act;
                break;
            }
        }
        return action ?
            this.actionable(onAction, action, this.name) :
            this.unactionable();
    },

    _updateToInfo() {
        if (this.info && this.info.length !== undefined) {
            if (this.info.length) {
                this.topCard.setInfo(this.info[this.info.length - 1]);
                this.size = this.info.length;
            } else this.size = 0;
        } else {
            this.topCard.setInfo();
            this.size = this.info;
        }

        if (this.size > 0) ui.show(this.tagSize, this.topCard.tagRoot);
        else ui.hide(this.tagSize, this.topCard.tagRoot);
    },
    _updateToSize() {
        this.tagSize.style.height = this.size + 'px';
        ui.move(this.tagSize,
            this.x,
            this.y - this.size,
            this.z + Pile.sizeZ
        );
        this.topCard.move(
            this.x,
            this.y - this.size,
            this.z + Pile.sizeZ + this.size + 1,
            0
        );
    },

    move: function(x, y, z) {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.z = Math.round(z);

        ui.move(this.tagBottom, x, y, z + Pile.bottomZ);
        this._updateToSize();

        return this;
    },

    getWidth: function() {
        return this.tagBottom.offsetWidth;
    },

    getHeight: function() {
        return this.topCard.getHeight() + this.size;
    },

    append: function(card, info) {
        this.tagRoot.appendChild(card.tagRoot);

        this.pendingCards.push(card);
        let size = (this.size + this.pendingCards.length);
        card.transitionZ(Math.max(this.z + Pile.depth, card.z + 1));
        requestAnimationFrame(() => setTimeout(() => {
            if (!this.info || this.info.length === undefined) card.unknown();
            else card.setInfo(info);
            card.move(
                this.x,
                this.y - size,
                this.z + Pile.sizeZ + size,
                0
            );
            setTimeout(() => this._completePendingCard(), Card.transitionTime);
        }, 0));
    },
    _completePendingCard: function() {
        let card = this.pendingCards.splice(0, 1)[0];
        this.tagRoot.removeChild(card.tagRoot);
        if (this.info && this.info.length !== undefined) this.info.push(card.info);
        else this.info++;
        this._updateToInfo();
        this._updateToSize();
        if (!this.pendingCards.length) {
            this.info = this.pendingInfo;
            this.pendingInfo = null;
        }
    },

    draw: function(info) {
        this.unactionable();
        let oldTop = this.topCard;
        oldTop.tagRoot.classList.remove('top');
        this.tagRoot.removeChild(oldTop.tagRoot);

        this.topCard = new Card();
        this.topCard.tagRoot.classList.add('top');

        if (this.info && this.info.length !== undefined) this.info.pop();
        else this.info--;
        this.setInfo(this.info);

        this.tagRoot.appendChild(this.topCard.tagRoot);

        return oldTop;
    }
}

module.exports = Pile;