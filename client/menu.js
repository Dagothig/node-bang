var ui = require('./ui'),
    misc = require('./misc');

module.exports = function(onDisconnect) {
    var element = ui.one('#menu'),
        disconnect = ui.one(element, '#disconnect');

    disconnect.onclick = function() {
        onDisconnect();
    }

    return {};
};