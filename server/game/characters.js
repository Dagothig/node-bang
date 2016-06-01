var Character = aReq('server/game/characters/character');

module.exports = require('fs')
    .readdirSync(__dirname + '/characters')
    .map(f => aReq('server/game/characters/' + f))
    .filter(c => c instanceof Character);

module.exports = [
    'slab-the-killer',
    'lucky-duke',
    'black-jack',
    'calamity-janet'
].map(f => aReq('server/game/characters/' + f));