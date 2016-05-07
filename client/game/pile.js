var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Pile() {
    this.cards = [];
    this.tagRoot = ui.create('div', 'card-pile');
    this.tagBottom = ui.create('div', 'bottom', this.tagRoot);
    this.topCard = new Card();
    this.tagRoot.appendChild(this.topCard.tagRoot);
    this.tagSize = ui.create('div', 'size', this.tagRoot);
    this.size = 0;
}
Pile.prototype = {
    constructor: Pile,

    setInfo: function(cardsInfo) {
        if (cardsInfo.length !== undefined) {
            if (cardsInfo.length) {
                ui.show(this.tagRoot);
                this.topCard.setInfo(cardsInfo[cardsInfo.length - 1].id).visible();
                this.size = cardsInfo.length - 1;
            } else this.size = 0;
        } else {
            ui.show(this.tagRoot);
            this.topCard.setInfo(null).unknown();
            this.size = cardsInfo - 1;
        }
        if (this.size) ui.show(this.tagRoot);
        else ui.hide(this.tagRoot);
        this.tagSize.style.height = this.size + 'px';
        return this;
    },

    move: function(x, y) {
        this.tagRoot.style.left = x + 'px';
        this.tagRoot.style.top = (y - this.size) + 'px';

        return this;
    },

    getWidth: function() {
        return this.topCard.getWidth();
    },

    getHeight: function() {
        return this.topCard.getHeight() + this.size;
    }
}

module.exports = Pile;