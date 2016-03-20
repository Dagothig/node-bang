var Character = aReq('server/game/characters/character');

module.exports = require('fs')
    .readdirSync('server/game/characters')
    .map(f => aReq('server/game/characters/' + f))
    .filter(c => c instanceof Character);