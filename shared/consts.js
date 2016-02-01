var seconds = amount => amount * 1000;
var minutes = amount => seconds(amount * 60);
var hours = amount => minutes(amount * 60);

module.exports = {
    disconnectTimeout: seconds(5),
    minPasswordLength: 4,

    minPlayers: 4,//4, TODO put back the proper amount
    maxPlayers: 8,
    gameStartTimer: 5,//10,
    characterChoices: 2,
    characterPickMaxTime: 0,//60
    rolePickMaxTime: 0,//10

    initCardMax: 5,
    lifeMax: 4,
    bangsMax: 1,
    drawMax: 2
};