var ui = require('../ui'),
    misc = require('../misc'),
    Card = require('./card');

function Cards(name, infoFunc) {
    this.name = name;
    this.infoFunc = infoFunc || 'setInfo';
    this.cards = [];
    this.visible = false;

    this.tagRoot = ui.create('div');

    this._onlyMove(0, 0, 0);
}
// Depth is fixed at 10; subject to change
Cards.depth = 10;
Cards.prototype = {
    constructor: Cards,

    setInfo: function(cardsInfo) {
        if (cardsInfo === undefined || cardsInfo === null) {
            this.cards.forEach(card => this.tagRoot.removeChild(card.tagRoot));
            this.cards.length = 0;
            this.visible = false;
            return;
        }

        let visible = cardsInfo && cardsInfo.length !== undefined;
        if (visible) {
            if (this.visible) {
                cardsInfo.forEach(info => {
                    // Abort if the info is accounted for
                    if (this.cards.find(c => c.is(info))) return;
                    // If the card is unnacounted for, then try to find an unknown
                    let unknown = this.cards.find(c => !c.info);
                    if (unknown) return unknown[this.infoFunc](info);
                    // If no appropriate unknown was found, add a new card
                    let card = new Card()[this.infoFunc](info);
                    this.cards.push(card);
                    this.tagRoot.appendChild(card.tagRoot);
                });

                // All of the remaining unknowns can be dumped
                for (let i = this.cards.length - 1; i >= 0; i--) {
                    let card = this.cards[i];
                    if (card.info) continue;
                    this.tagRoot.removeChild(card.tagRoot);
                    this.cards.splice(i, 1);
                }
            } else {
                // Go through each info, create if needed and update the cards
                for (let i = 0; i < cardsInfo.length; i++) {
                    let card = this.cards[i];
                    let info = cardsInfo[i];
                    if (!card) {
                        card = new Card();
                        this.cards.push(card);
                        this.tagRoot.appendChild(card.tagRoot);
                    }
                    card[this.infoFunc](info);
                }
                // Go through the cards that are extra; remove them
                for (let i = this.cards.length - 1; i >= cardsInfo.length; i--) {
                    let card = this.splice(i, 1)[0];
                    this.tagRoot.removeChild(card.tagRoot);
                }
            }
        } else {
            if (this.visible) this.cards.forEach(card => card[this.infoFunc]());
            while (cardsInfo > this.cards.length) {
                let card = new Card().setInfo();
                this.cards.push(card);
                this.tagRoot.appendChild(card.tagRoot);
            }
            while (cardsInfo < this.cards.length) {
                let card = this.cards.pop();
                this.tagRoot.removeChild(card.tagRoot);
            }
        }

        this.visible = visible;

        return this;
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

    _onlyMove: function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },

    move: function(x, y, z, angle, density) {
        return this._onlyMove(x, y, z).rotate(angle, density);
    },
    arcMove: function(x, y, z, angle, arcAngle, density) {
        return this._onlyMove(x, y, z).arcRotate(angle, arcAngle, density);
    },

    rotate: function(angle, density) {
        if (this.angle !== angle) {
            this.dirX = Math.cos(angle);
            this.dirY = Math.sin(angle);
        }

        this.angle = angle;
        this.arcAngle = 0;
        this.density = density || 1;

        this.cards.forEach((card, cI) => {
            let shiftedI = (cI - (this.cards.length - 1) / 2) * this.density;
            let offset = shiftedI * card.tagRoot.offsetWidth / Card.hoverScale;
            card.move(
                this.x + this.dirX * offset,
                this.y + this.dirY * offset,
                this.z + cI,
                angle
            );
        });

        return this;
    },
    arcRotate: function(angle, arcAngle, density) {
        if (this.angle !== angle) {
            this.dirX = Math.cos(angle + Math.HALF_PI);
            this.dirY = Math.sin(angle + Math.HALF_PI);
        }

        this.angle = angle;
        this.arcAngle = arcAngle;
        this.density = density ||
            (0.7 - this.cards.length / 30) / (this.visible ? 1 : 2);

        let cardSize = {
            x: (this.cards[0] && this.cards[0].tagRoot.offsetWidth),
            y: (this.cards[0] && this.cards[0].tagRoot.offsetHeight),
        };
        cardSize.x /= Card.hoverScale;
        cardSize.y /= Card.hoverScale;

        let arcLength = cardSize.x * (this.cards.length - 1);
        let arcRadius = arcLength / arcAngle;

        let arcPerCard = arcAngle / this.cards.length;
        this.cards.forEach((card, cI) => {
            let shiftedI = (cI - (this.cards.length - 1) / 2) * this.density;
            let arcX = Math.cos(arcPerCard * shiftedI + angle - Math.HALF_PI);
            let arcY = Math.sin(arcPerCard * shiftedI + angle - Math.HALF_PI);
            card.move(
                this.x +
                this.dirX * arcRadius +
                arcX * arcRadius,

                this.y +
                this.dirY * arcRadius +
                arcY * arcRadius,

                this.z + cI,

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
    },

    append: function(card) {
        this.tagRoot.appendChild(card.tagRoot);
        this.cards.push(card);
        if (!this.visible) card[this.infoFunc]();
    },

    draw: function(info) {
        let card = null;
        for (let i = 0; i < this.cards.length; i++) {
            if (!this.cards[i].is(info)) continue;
            card = this.cards.splice(i, 1)[0];
            break;
        }

        if (!card) card = this.cards.pop();
        this.tagRoot.removeChild(card.tagRoot);
        return card.unactionable().setInfo(info);
    }
}

module.exports = Cards;