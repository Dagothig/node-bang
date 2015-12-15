var chalk = require('chalk');

module.exports = function log() {
    console.log.call(this, chalk.bgRed(
        '[' + chalk.yellow('Bang') + ']' +
        Array.from(arguments)
            .reduce((s, v, i) => s + ' ' + v, '')
    ));
};
