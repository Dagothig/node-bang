module.exports = {
    authValidation: 'Name and password must be present.\n' +
                    'Password must be at least 4 characters long.',
    authNameTaken: 'Name is already in use.',
    authToken: 'Token is invalid',
    playerCapped: 'The game is full',
    notEnoughPlayers: 'The game needs more players to start',
    startTimer: (timer) => 'Starting in ' + timer + ' seconds',
    allowanceExceeded: 'Allowance exceeded'
};
