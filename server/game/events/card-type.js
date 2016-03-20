'use strict';

var misc = aReq('server/misc'),
    CardTypesEvent = require('./card-types');

function CardTypeEvent(player, cardType, onChoice, onCancel, format) {
    CardTypesEvent.call(this, player, [cardType], onChoice, onCancel, format);
}
CardTypeEvent.prototype = misc.merge(Object.create(CardTypesEvent.prototype), {
    constructor: CardTypeEvent,
});

module.exports = CardTypeEvent;