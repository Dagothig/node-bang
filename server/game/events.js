'use strict';

var misc = aReq('server/misc'),
    Event = aReq('server/game/events/event'),
    Choice = aReq('server/game/events/choice');

var events = misc.merge((eventName, player, step) => {
    // Since we want to return a function that behaves as if called on the proper
    // object and since lambdas cannot reference the arguments object, then we must
    // create a function to delegate the call on the proper object
    return (player && player.character[eventName]) ?
        function() {
            return player.character[eventName]
                .apply(player.character, misc.fromArrays(arguments, [step]));
        } :
        function() {
            let event = events.raw[eventName];
            let args = Array.from(arguments);
            function Tempo() {
                event.apply(this, args);
            }
            Tempo.prototype = event.prototype;
            return new Tempo();
        };
}, {
    raw: require('fs')
    .readdirSync(__dirname + '/events')
    .map(f => aReq('server/game/events/' + f))
    .filter(ev => ev !== Choice)
    .reduce((raw, ev) => Object.defineProperty(
            raw,
            misc.camelCase(ev === Event ? ev.name : ev.name.replace('Event', '')),
            { enumerable: true, value: ev }
        ), {})
});
module.exports = events;