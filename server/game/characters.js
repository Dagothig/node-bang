var Character = aReq('server/game/characters/character');

module.exports = require('fs')
    .readdirSync(__dirname + '/characters')
    .map(f => aReq('server/game/characters/' + f))
    .filter(c => c instanceof Character);

module.exports = [
    'jesse-jones',
    'bart-cassidy',
    'pedro-ramirez',
    'jourdonnais',
    'rose-doolan',
    'calamity-janet',
    'paul-regret',
    'slab-the-killer'
].map(f => aReq('server/game/characters/' + f));