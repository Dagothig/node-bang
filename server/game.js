var log = require('./log.js'),
    msgs = require('../shared/messages.js'),
    strings = require('../shared/strings.js');

var minPlayers = 4, maxPlayers = 7;

var io, users;
var game;

function formattedGame(user) {
    return game ? {
        players: game.players.map((player) => {
            return {
                life: player.life,
                maxLife: player.maxLife
            };
        })
    } : undefined;
}

function formattedJoining() {
    var joining = users
        .filter((user) => user.joining)
        .map((user) => {
            return {
                name: user.name
            };
        });
    return {
        users: joining,
        reason: joining.length >= maxPlayers ? strings.playerCapped :
            (joining.length < minPlayers ? strings.notEnoughPlayers :
            (undefined))
    }
}

module.exports = {
    setup: function setupLobby() {
        io = arguments[0];
        users = arguments[1];
        arguments[2].listen(this);
    },
    onConnected: function onConnected(user, socket) {
        socket.on(msgs.game, function(msg) {
            socket.emit(msgs.game, formattedGame(user));
        });
        socket.on(msgs.joining, function(msg) {
            if (!game) {
                if (user.token !== msg.token) return;
                var joining = formattedJoining();
                if (user.joining !== msg.joining) {
                    user.joining = !user.joining && msg.joining && joining.users.length < maxPlayers;
                }
                log(user.name, user.joining ? 'is' : 'is not', 'joining');
                io.emit(msgs.joining, formattedJoining());
            }
        });
        socket.emit(msgs.joining, formattedJoining());
        socket.emit(msgs.game, formattedGame(user));
    },
    onDisconnected: function onDisconnected(user, socket) {
        if (!game) io.emit(msgs.joining, formattedJoining());
    }
}
