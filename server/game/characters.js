module.exports = [
    'bart-cassidy',
    'black-jack',
    'calamity-janet',
    'el-gringo',
    'jesse-jones',
    'jourdonnais',
    'kit-carlson',
    'lucky-duke',
    'paul-regret',
    'rose-doolan',
    'sid-ketchum',
    'slab-the-killer',
    'suzy-lafayette',
    'vulture-sam',
    'willy-the-kid'
].map(name => aReq('server/game/characters/' + name));