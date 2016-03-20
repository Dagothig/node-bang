'use strict';

var misc = aReq('server/misc'),
    CardChoiceEvent = require('./card-choice');

function CardTypesEvent(player, cardTypes, onChoice, onCancel, format) {
    CardChoiceEvent.call(this,
        player,
        player.hand.filter(c => cardTypes.find(cardType => c instanceof cardType)),
        onChoice, onCancel, format
    );
}
CardTypesEvent.prototype = misc.merge(Object.create(CardChoiceEvent.prototype), {
    constructor: CardTypesEvent,
});

module.exports = CardTypesEvent;