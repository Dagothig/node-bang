var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Pile(name) {
    this.name = name;
    this.size = 0;
    this.visible = false;

    this.tagRoot = ui.create('div', 'card-pile');
    this.tagBottom = ui.create('div', 'bottom', this.tagRoot);
    this.tagSize = ui.create('div', 'size', this.tagRoot);
    this.topCard = new Card();
    this.topCard.tagRoot.classList.add('top');
    this.tagRoot.appendChild(this.topCard.tagRoot);

    this.pendingCards = [];
    this.pendingInfo = null;
    ui.hide(this.tagSize, this.topCard.tagRoot);

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
        this.visible = cardsInfo && cardsInfo.length !== undefined;

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
        if (this.visible) {
            if (this.info.length) {
                this.topCard.setInfo(this.info[this.info.length - 1]);
                this.size = this.info.length;
            } else this.size = 0;
        } else {
            this.topCard.setInfo(null);
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
        if (this.visible) {
            this.topCard.visible();
            this.pendingCards.forEach(card => card.visible());
        }
        else {
            this.topCard.unknown();
            this.topCard.info = null;
            this.pendingCards.forEach(card => {
                card.unknown();
                card.info = null;
            });
        }
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

    append: function(card) {
        card.transitionZ(this.z + Pile.depth + 10000);
        this.tagRoot.appendChild(card.tagRoot);

        this.pendingCards.push(card);
        let size = (this.size + this.pendingCards.length);
        requestAnimationFrame(() => setTimeout(() => {
            card.move(
                this.x,
                this.y - size,
                this.z + Pile.depth + 10000,
                0
            );
            card.pilePendingTimeout =
                setTimeout(() => this._completePendingCard(), Card.transitionTime);
        }, 0));
    },
    _completePendingCard: function() {
        let card = this.pendingCards.splice(0, 1)[0];
        delete card.pilePendingTimeout;

        this.tagRoot.removeChild(card.tagRoot);

        if (this.visible) this.info.push(card.info);
        else this.info++;

        this._updateToInfo();
        this._updateToSize();

        if (!this.pendingCards.length) {
            this.info = this.pendingInfo;
            this.pendingInfo = null;
        }
    },

    draw: function(info) {
        if (this.pendingCards.length) {
            let card = this.pendingCards.pop();
            clearTimeout(card.pilePendingTimeout);
            delete card.pilePendingTimeout;
            this.tagRoot.removeChild(card.tagRoot);
            return card.setInfo(info);
        }

        this.unactionable();
        let oldTop = this.topCard;
        oldTop.tagRoot.classList.remove('top');
        this.tagRoot.removeChild(oldTop.tagRoot);

        this.topCard = new Card();
        this.topCard.tagRoot.classList.add('top');

        if (this.visible) this.info.pop();
        else this.info--;

        this._updateToInfo();
        this._updateToSize();

        this.tagRoot.appendChild(this.topCard.tagRoot);

        if (info) oldTop.setInfo(info);
        else oldTop.info = info;
        return oldTop;
    }
}

module.exports = Pile;