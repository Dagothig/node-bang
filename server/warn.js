var chalk = require('chalk'),
    misc = aReq('server/misc');

module.exports = function log() {
    console.log.call(this, chalk.bgRed(
        chalk.gray(misc.simpleTime()) +
        ' [' + chalk.yellow('Bang') + ']' +
        Array.from(arguments).reduce((s, v, i) => s + ' ' + v, '')
    ));
};
