var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Pile(name) {
    this.name = name;
    this.visible = false;

    this.tagRoot = ui.create('div', 'card-pile');
    this.tagBottom = ui.create('div', 'bottom', this.tagRoot);
    this.tagSize = ui.create('div', 'size', this.tagRoot);
    this.topCard = new Card();
    this.topCard.tagRoot.classList.add('top');
    this.tagRoot.appendChild(this.topCard.tagRoot);
    ui.hide(this.tagSize, this.topCard.tagRoot);

    this.pending = [];

    this.move(0, 0, 0);
    this._onPending = () => {
        let card = this.pending.shift();
        delete card._pendingTimeout;
        this.tagRoot.removeChild(card.tagRoot);
        if (this.visible) this.info.push(card.info);
        else this.info++;

        this._updateToInfo()._updateToSize();
    };
}
Pile.bottomZ = 0;
Pile.sizeZ = Pile.bottomZ + 1;
Pile.topCardZ = Pile.sizeZ + 100;
Pile.depth = Pile.topCardZ + 1;
Pile.prototype = {
    constructor: Pile,

    get size() { return this.visible ? this.info.length : this.info; },
    get fullSize() { return this.pending.length + this.size; },
    set fullSize(val) {
        if (this.visible) throw "That's just not legit.";
        // There's a special case where we need to shrink and we have more pending than our new size. We can't actually graciously handle that
        if (val < this.fullSize && this.pending.length > val)
            this.setInfo(val);
        else {
            this.info = val - this.pending.length;
            this._updateToSize();
        }
        return val;
    },

    setInfo: function(cardsInfo) {
        this.visible = cardsInfo && cardsInfo.length !== undefined;
        this.pending.forEach(card => {
            clearTimeout(card._pendingTimeout);
            this.tagRoot.removeChild(card.tagRoot);
        })
        this.pending.length = 0;
        this.info = cardsInfo;

        return this._updateToInfo()._updateToSize();
    },
    checkInfo: function(cardsInfo) {
        return (cardsInfo && cardsInfo.length !== undefined) ?

            this.fullSize === cardsInfo.length &&
            this.pending.every((card, i) => card.is(cardsInfo[i + this.size])) :

            this.fullSize === cardsInfo;
    },

    actionable: function(onAction, action, arg) {
        if (this.fullSize > 0)  {
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
        let action = Object.entries(actions)
            .find(entry => entry[1].indexOf(this.name) !== -1);
        return action ?
            this.actionable(onAction, action[0], this.name) :
            this.unactionable();
    },

    _updateToInfo() {
        this.topCard.setInfo(this.visible && this.info.length
            && this.info[this.info.length - 1]);

        if (this.size > 0) ui.show(this.tagSize, this.topCard.tagRoot);
        else ui.hide(this.tagSize, this.topCard.tagRoot);

        return this;
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
        this.pending.forEach((card, i) => card.move(
            this.x,
            this.y - this.size - 1 - i,
            this.z + Pile.depth + this.size + 2 + i + 10000,
            0
        ));
        this.pending.filter(c => !c._pendingTimeout).forEach(c =>
            c._pendingTimeout = setTimeout(this._onPending, Card.transitionTime));
        if (this.visible) {
            this.topCard.visible();
            this.pending.forEach(card => card.visible());
        } else {
            this.topCard.unknown();
            this.topCard.info = null;
            this.pending.forEach(card => card.unknown().info = null);
        }

        return this;
    },

    move: function(x, y, z) {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.z = Math.round(z);

        ui.move(this.tagBottom, x, y, z + Pile.bottomZ);
        this._updateToSize();

        return this;
    },

    getWidth: function() { return this.tagBottom.offsetWidth; },
    getHeight: function() { return this.topCard.getHeight() + this.size; },

    append: function(card) {
        this.pending.push(card);
        this.tagRoot.appendChild(card.tagRoot);
        card.clearMovingTimeout().transitionZ(this.z + Pile.depth + 10000);
        return this;
    },

    draw: function(info) {
        this.unactionable();

        if (this.pending.length) {
            let card = this.pending.pop();
            clearTimeout(card._pendingTimeout);
            delete card._pendingTimeout;
            card.setPositionToVisiblePosition();
            this.tagRoot.removeChild(card.tagRoot);
            if (info) card.setInfo(info);
            return card;
        }

        let oldTop = this.topCard;
        oldTop.tagRoot.classList.remove('top');
        this.tagRoot.removeChild(oldTop.tagRoot);
        if (info) oldTop.setInfo(info);

        this.topCard = new Card();
        this.topCard.tagRoot.classList.add('top');

        if (this.visible) this.info.pop();
        else this.info--;

        this._updateToInfo()._updateToSize();

        this.tagRoot.appendChild(this.topCard.tagRoot);

        return oldTop;
    }
}

module.exports = Pile;