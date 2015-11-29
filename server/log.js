var chalk = require('chalk');

module.exports = function log() {
    var prepended = Array.from(arguments);
    prepended.unshift('[' + chalk.yellow('Bang!') + ']');
    console.log.apply(this, prepended);
};
