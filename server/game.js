var log = aReq('server/log'),
    msgs = aReq('shared/messages'),
    strings = aReq('shared/strings'),
    consts = aReq('shared/consts'),
    Game = aReq('server/game/game');

var io, users;
var gameStartTimer = null, gameStartInterval;
var game;

function formattedGame(user) {
    return game ? game.formatted(user) : null;
}

function startGame() {
    log("Starting game!");
    game = new Game(
        users.filter((user) => user.joining),
        () => users.forEach((user) => user.emit(msgs.game, formattedGame(user)))
    );
    users.forEach((user) => {
        user.joining = false;
    });
    game.begin();
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
        reason: (joining.length >= consts.maxPlayers ? strings.playerCapped :
            (joining.length < consts.minPlayers ? strings.notEnoughPlayers :
            (''))) +
            (gameStartTimer !== null ? strings.startTimer(gameStartTimer) : '')
    }
}

function canStart() {
    var count = users.filter((user) => user.joining).length;
    return count >= consts.minPlayers && count <= consts.maxPlayers;
}
function startTimer() {
    if (gameStartInterval) clearInterval(gameStartInterval);

    gameStartTimer = consts.gameStartTimer;
    log("Game starts in", gameStartTimer, "seconds");
    io.emit(msgs.joining, formattedJoining());

    gameStartInterval = setInterval(function() {
        gameStartTimer--;
        log("Game starts in", gameStartTimer, "seconds");
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
            if (game || user.token !== msg.token) return;
            var joining = formattedJoining();
            if (user.joining !== msg.joining) {
                user.joining = !user.joining && msg.joining
                    && joining.users.length < consts.maxPlayers;
                log(user.name, user.joining ? 'is' : 'is not', 'joining');
                // If the status change was successful then the states will be the same now
                if (user.joining === msg.joining) {
                    if (canStart()) startTimer();
                    else stopTimer();
                }
            }

            io.emit(msgs.joining, formattedJoining());
        });

        socket.on(msgs.action, function(msg) {
            if (!game || user.token !== msg.token) return;
            game.handleAction(user, msg);
        });

        socket.emit(msgs.game, formattedGame(user));
        socket.emit(msgs.joining, formattedJoining());
    },
    onDisconnected: function onDisconnected(user, socket) {
        if (user.joining) {
            if (canStart()) startTimer();
            else stopTimer();
        }
        if (!game) io.emit(msgs.joining, formattedJoining());
    }
}
