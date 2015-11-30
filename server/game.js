var log = require('./log.js'),
    msgs = require('../shared/messages.js'),
    strings = require('../shared/strings.js');

var minPlayers = 4, maxPlayers = 7;

var io, users;
var gameStartTimer = null, gameStartInterval;
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

function startGame() {
    users.forEach((user) => user.joining = false);
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
        reason: (joining.length >= maxPlayers ? strings.playerCapped :
            (joining.length < minPlayers ? strings.notEnoughPlayers :
            (''))) +
            (gameStartTimer !== null ? strings.startTimer(gameStartTimer) : '')
    }
}

function canStart() {
    var count = users.filter((user) => user.joining).length;
    return count >= minPlayers && count <= maxPlayers;
}
function startTimer() {
    if (gameStartInterval) clearInterval(gameStartInterval);

    gameStartTimer = 10;
    io.emit(msgs.joining, formattedJoining());

    gameStartInterval = setInterval(function() {
        gameStartTimer--;
        if (gameStartTimer) io.emit(msgs.joining, formattedJoining());
        else {
            clearInterval(gameStartInterval);
            gameStartInterval = null;
            gameStartTimer = null;
            startGame();
        }
    }, 1000);
}
function stopTimer() {
    if (gameStartInterval) clearInterval(gameStartInterval);
    gameStartInterval = null;
    gameStartTimer = null;
    io.emit(msgs.joining, formattedJoining());
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
                    user.joining = !user.joining && msg.joining
                        && joining.users.length < maxPlayers;
                    // If the status change was successful then the states will be the same now
                    if (user.joining === msg.joining) {
                        if (canStart()) startTimer();
                        else stopTimer();
                    }
                }
                log(user.name, user.joining ? 'is' : 'is not', 'joining');
                io.emit(msgs.joining, formattedJoining());
            }
        });
        if (game) socket.emit(msgs.game, formattedGame(user));
        else socket.emit(msgs.joining, formattedJoining());
    },
    onDisconnected: function onDisconnected(user, socket) {
        if (user.joining) {
            if (canStart()) startTimer();
            else stopTimer();
        }
        if (!game) io.emit(msgs.joining, formattedJoining());
    }
}
