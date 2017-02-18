var ui = require('./ui'),
    misc = require('./misc');

module.exports = function(onRetry) {
    var element = ui.one('#unknown'),
        retryBtn = ui.one(element, '#retry');

    retryBtn.onclick = function() {
        onRetry();
    }

    return {
        element: element,
        retryBtn: retryBtn
    };
}