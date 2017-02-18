let crypto = require('crypto'),
    misc = aReq('server/misc'),
    childProcess = require('child_process');

let names = [
    'SirBottington',
    '3lit3Botter',
    'Botty',
    'Twadobot',
    'Twadeceptibot',
    'Botlicious',
    'WildWildBot'
];

function Bot(users, bots) {
    let remaining = names.filter(name =>
            !users.find(user => user.name === name) &&
            !bots.find(bot => bot.name === name));
    let iterate = 0;
    while (!remaining.length)
        remaining = names.map(name => name + '_copycat' + (++iterate))
            .filter(name =>
                !users.find(user => user.name === name) &&
                !bots.find(bot => bot.name === name));
    this.name = misc.rand(remaining);
    this.process = childProcess.spawn(
        process.argv[0],
        [__dirname + '/bot',
            '--user-name=' + this.name,
            '--delay=500',
            '--server=http://localhost:' + process.env.PORT
        ]
    );
}
Bot.prototype.kill = function() { this.process.kill(); }


module.exports = Bot;