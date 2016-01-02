var chalk = require('chalk'),
    misc = aReq('server/misc');

module.exports = function log() {
    var prepended = Array.from(arguments);
    prepended.unshift(chalk.gray(misc.simpleTime()) + ' [' + chalk.yellow('Bang') + ']');
    console.log.apply(this, prepended);
};
