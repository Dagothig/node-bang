'use strict';

require('./global');
const io = require('socket.io-client'),
    chalk = require('chalk'),
    misc = aReq('server/misc'),
    msgs = aReq('shared/messages'),
    strs = aReq('shared/strings');

var params = misc.parseArgs(process.argv, {
    server: 'http://localhost:8080',
    userName: 'botty',
    userPassword: 'bots',
    delay: 0
}, console.log, console.log);

const socket = io.connect(params.server, {reconnect: true});
var msgQueue = [], moratorium = 0, ongoingMsgTimer, ongoingMsg;
function emit(key, msg = null, delay = moratorium) {
    if (ongoingMsgTimer) msgQueue.push(arguments);
    else {
        ongoingMsg = arguments;
        ongoingMsgTimer = setTimeout(
            () => {
                socket.emit(key, msg);
                ongoingMsgTimer = null;
                if (msgQueue.length) emit.apply(null, msgQueue.shift());
            },
            delay + params.delay
        );
    }
}
setInterval(() => moratorium > 0 ? moratorium -= 50 : moratorium = 0, 100);

// String keys
Object.entries(misc.merge({
    connect: () => console.log('Connected'),
    disconnect: () => {
        ongoing = null;
        console.log('Disconnected');
    },
    error: msg => {
        console.error(chalk.red(msg));
        if (msg.startsWith(strs.allowanceExceeded)) {
            moratorium = 1000 * Array.from(msg)
                .filter(n => n >= '0' && n <= '9')
                .join('')|0;
            if (ongoingMsgTimer) {
                clearTimeout(ongoingMsgTimer);
                ongoingMsgTimer = null;
                ongoingMsg[2] = moratorium;
                emit.apply(ongoingMsg);
            }

            if (!user) emit(msgs.auth);
            else if (!ongoing) emit(msgs.game);
            else msgHandlers.game(ongoing);
        }
        // TODO reattempt stuff
    }
})).forEach(entry => socket.on.apply(socket, entry));

// Message keys
var user, users, ongoing;
var msgHandlers = {
    alert: msg => console.log('alert:', msg),
    auth: msg => {
        if (msg) {
            console.log('auth:', msgs.auth, msg);
        } else {
            var auth = {
                name: params.userName,
                password: params.userPassword
            };
            console.log('Attempting auth with' , auth);
            emit(msgs.auth, auth);
        }
    },
    user: msg => {
        user = msg;
        if (!user) ongoing = null;
        if (user && !ongoing) {
            console.log('Asking about game');
            emit(msgs.joining, { token: user.token });
        }
    },
    game: game => {
        ongoing = game;
        if (game) {
            if (game.actions) {
                let keys = Object.keys(game.actions)
                let n = keys.reduce((n, act) => n + game.actions[act].length, 0);
                if (!n) return;
                let val = (Math.random() * n)|0;
                for (let i = 0; i < keys.length; i++) {
                    let act = keys[i];
                    let actLen = game.actions[act].length;
                    if (val >= actLen) {
                        val -= actLen;
                    } else {
                        msgQueue.length = 0;
                        return emit(msgs.action, {
                            token: user.token,
                            action: act,
                            arg: game.actions[act][val]
                        });
                    }
                }
            }
        } else {
            console.log("Asking who's in");
            emit(msgs.joining, { token: user.token });
        }
    },
    joining: msg => {
        if (user && !msg.users.find(u => u.name === user.name)) {
            console.log('Asking to participate');
            emit(msgs.joining, { token: user.token, joining: true });
        }
    },
    event: msg => {},
};
Object.entries(msgHandlers)
    .forEach(entry => socket.on.call(socket, msgs[entry[0]], entry[1]));