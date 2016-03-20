'use strict';

var misc = aReq('server/misc');
var Event = aReq('server/game/events/event');

var events = misc.merge((eventName, player) => {
    // Since we want to return a function that behaves as if called on the proper
    // object and since lambdas cannot reference the arguments object, then we must
    // create a function to delegate the call on the proper object
    return (player && player.character[eventName]) ?
        function() {
            return player.character[eventName].apply(player.character, arguments);
        } :
        events.raw[eventName];
}, {
    raw: require('fs')
    .readdirSync('server/game/events')
    .map(f => aReq('server/game/events/' + f))
    .filter(ev => ev !== Event)
    .reduce((raw, ev) => Object.defineProperty(
            raw,
            misc.camelCase(ev.name.replace('Event', '')),
            { enumerable: true, value: ev }
        ), {})
});
module.exports = events;