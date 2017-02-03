var log = aReq('server/log'),
    msgs = aReq('shared/messages'),
    strings = aReq('shared/strings'),
    consts = aReq('server/consts'),
    misc = aReq('server/misc'),
    Game = aReq('server/game/game');

var gameStartTimer = null, gameStartInterval;
var game;

var formattedGame = user => game ? game.formatted(user) : null;
var formattedReason = joining => [
    (joining.length >= consts.maxPlayers ? strings.playerCapped :
    (joining.length < consts.minPlayers ? strings.notEnoughPlayers :
    null)),
    (gameStartTimer !== null ? strings.startTimer(gameStartTimer) :
    null)
].filter(n => n).join('\n');
var formattedJoining = users => {
    var joining = users
        .filter(user => user.joining)
        .map(user => ({
            name: user.name
        }));
    return {
        users: joining,
        reason: formattedReason(joining),
        minPlayers: consts.minPlayers,
        maxPlayers: consts.maxPlayers
    };
}
var canStart = users => misc.bounded(
    users.filter(user => user.joining).length,
    consts.minPlayers, consts.maxPlayers
);

function startTimer(io, users) {
    if (gameStartInterval) clearInterval(gameStartInterval);

    gameStartTimer = consts.gameStartTimer;
    gameStartInterval = setInterval(function() {
        if (--gameStartTimer > 0)
            users.emit(msgs.joining, formattedJoining(users));
        else {
            clearInterval(gameStartInterval);
            gameStartInterval = null;
            gameStartTimer = null;
            startGame(io, users);
        }
    }, 1000);
}

function stopTimer(io, users) {
    if (gameStartInterval) {
        clearInterval(gameStartInterval);
        users.emit(msgs.joining, formattedJoining(users));
        gameStartInterval = null;
        gameStartTimer = null;
    }
}

function startGame(io, users) {
    log("Starting game!");
    game = new Game(
        users.filter(user => user.joining),
        // On update
        () => users.forEach(user => user.emit(msgs.game, formattedGame(user))),
        // On event
        msg => {
            if (!(msg instanceof Function)) users.emit(msgs.event, msg);
            else users.forEach(user =>
                user.emit(msgs.event, msg(game.findPlayer(user))));
        },
        // On end
        () => {
            game = null;
            log('Game finished!');
            users.emit(msgs.joining, formattedJoining(users));
        }
    );
    users.forEach(user => user.joining = false);
    game.begin();
}

function handleGame(io, users, user, socket) {
    socket.emit(msgs.game, formattedGame(user));
}

function handleJoining(io, users, user, socket, msg) {
    if (game) return handleGame(io, users, user, socket);
    if (!msg || user.token !== msg.token) return;
    var joining = formattedJoining(users);
    if (msg.joining !== undefined && user.joining !== msg.joining) {
        user.joining = !user.joining && msg.joining
            && joining.users.length < consts.maxPlayers;
        log(user.name, user.joining ? 'is' : 'is not', 'joining');
        // If the status change was successful then the states will be the same now
        if (user.joining === msg.joining) {
            if (canStart(users)) startTimer(io, users);
            else stopTimer(io, users);
        }
        users.emit(msgs.joining, formattedJoining(users));
    } else {
        socket.emit(msgs.joining, joining);
    }
}

function handleAction(io, users, user, socket, msg) {
    if (!msg || user.token !== msg.token || !game) return;
    game.handleAction(user, msg);
}

module.exports = (io, users) => ({
    onConnected: (user, socket) => {
        socket.on(msgs.game, () =>
            handleGame(io, users, user, socket));

        socket.on(msgs.joining, msg =>
            handleJoining(io, users, user, socket, msg));

        socket.on(msgs.action, msg =>
            handleAction(io, users, user, socket, msg));
    },
    onDisconnected: (user, socket) => {
        if (game) game.handleDisconnect(user);
        else {
            if (user.joining) {
                if (canStart(users)) startTimer(io, users);
                else stopTimer(io, users);
            }
            users.emit(msgs.joining, formattedJoining(users));
        }
    }
});