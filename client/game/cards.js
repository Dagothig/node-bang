var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Cards() {
    this.cards = [];
    this.tagRoot = ui.create('div', 'relative');
}
Cards.prototype = {
    constructor: Cards,

    setInfo: function(cardsInfo) {
        this.cards.forEach(card => this.tagRoot.removeChild(card.tagRoot));
        this.cards = cardsInfo ?
            (cardsInfo.length ?
                cardsInfo.map(card => new Card().setInfo(card.id).visible()) :
                misc.gen(() => new Card(), cardsInfo)
            ) : [];
        this.visible = cardsInfo && cardsInfo.length;
        this.cards.forEach(card => this.tagRoot.appendChild(card.tagRoot));

        return this;
    },

    move: function(x, y) {
        this.tagRoot.style.left = x + 'px';
        this.tagRoot.style.top = y + 'px';

        return this;
    },
    rotate: function(angle, density) {
        this.density = density || 1;
        let dirX = Math.cos(angle);
        let dirY = Math.sin(angle);
        this.cards.forEach((card, cI) => {
            let shiftedI = (cI - (this.cards.length - 1) / 2) * this.density;
            card.move(
                dirX * shiftedI * card.tagRoot.offsetWidth / Card.hoverScale,
                dirY * shiftedI * card.tagRoot.offsetWidth / Card.hoverScale,
                angle
            );
        });

        return this;
    },
    arcRotate: function(angle, arcAngle, density) {
        this.density = density || 1;
        let cardSize = {
            x: (this.cards[0] && this.cards[0].tagRoot.offsetWidth),
            y: (this.cards[0] && this.cards[0].tagRoot.offsetHeight),
        };
        cardSize.x /= Card.hoverScale;
        cardSize.y /= Card.hoverScale;

        let arcLength = cardSize.x * (this.cards.length - 1);
        let arcRadius = arcLength / arcAngle;

        let dirX = Math.cos(angle + Math.HALF_PI);
        let dirY = Math.sin(angle + Math.HALF_PI);

        let arcPerCard = arcAngle / this.cards.length;
        this.cards.forEach((card, cI) => {
            let shiftedI = (cI - (this.cards.length - 1) / 2) * this.density;
            let arcX = Math.cos(arcPerCard * shiftedI + angle - Math.HALF_PI);
            let arcY = Math.sin(arcPerCard * shiftedI + angle - Math.HALF_PI);
            card.move(
                dirX * arcRadius +
                arcX * arcRadius,
                dirY * arcRadius +
                arcY * arcRadius,
                angle + arcPerCard * shiftedI
            );
        });

        return this;
    },
    getWidth: function() {
        let card = this.cards[0];
        if (!card) return 0;
        let cardWidth = card.getWidth();
        return cardWidth + cardWidth * (this.cards.length - 1) * this.density;
    },
    getHeight: function() {
        let card = this.cards[0];
        return this.cards.length ? card.getHeight() : 0;
    }
}

module.exports = Cards;