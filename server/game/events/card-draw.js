'use strict';

var misc = aReq('server/misc'),
    CardsDrawEvent = require('./cards-draw');

function CardDrawEvent(player, cards, onDraw, onCancel, format) {
    CardsDrawEvent.call(this, player,
        cards, 1,
        c => onDraw(c[0]), onCancel,  format
    );
}
CardDrawEvent.prototype = misc.merge(Object.create(CardsDrawEvent.prototype), {
    constructor: CardDrawEvent,
});

module.exports = CardDrawEvent;