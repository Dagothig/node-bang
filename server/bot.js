let crypto = require('crypto'),
    consts = aReq('server/consts'),
    misc = aReq('server/misc'),
    log = aReq('server/log'),
    childProcess = require('child_process');

let names = [
    'SirBottington',
    '3lit3Botter',
    'Botty',
    'Twadobot',
    'Twadoceptibot',
    'Botlicious',
    'WildWildBot'
];

function Bot(users, bots) {
    let remaining = names.filter(name =>
            !users.find(user => user.isName(name)) &&
            !bots.find(bot => bot.name === name));
    let iterate = 1;
    let title = n => '_the_' + n +
        (n%10 === 1 && n%100 !== 11 ? 'st' :
        (n%10 === 2 ? 'nd' :
        (n%10 === 3 ? 'rd' : 'th')));
    while (!remaining.length) {
        iterate++;
        remaining = names.map(name => name + title(iterate))
            .filter(name =>
                !users.find(user => user.isName(name)) &&
                !bots.find(bot => bot.name === name));
    }
    this.name = misc.rand(remaining);
    log('Spawning', this.name);
    this.process = childProcess.spawn(
        process.argv[0],
        [__dirname + '/../bot',
            '--user-name=' + this.name,
            consts.botArguments,
            '--server=http://localhost:' + (process.env.PORT || consts.defaultPort)
        ]
    );
}
Bot.prototype.kill = function() {
    log('Shutting down', this.name);
    this.process.kill();
}


module.exports = Bot;