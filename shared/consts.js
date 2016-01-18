var seconds = amount => amount * 1000;
var minutes = amount => seconds(amount * 60);
var hours = amount => minutes(amount * 60);

module.exports = {
    disconnectTimeout: seconds(5),
    minPasswordLength: 4,

    minPlayers: 2,//4, TODO put back the proper amount
    maxPlayers: 2,
    gameStartTimer: 0,//10
    characterChoices: 2,
    characterPickMaxTime: 60,
    rolePickMaxTime: 10,

    initCardMax: 5,
    lifeMax: 4,
    bangsMax: 1,
    drawMax: 2
};