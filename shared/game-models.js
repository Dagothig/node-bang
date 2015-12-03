var misc = require('./misc.js');

function Game(users) {
    this.players = misc.shuffle(users.map((user) => new Player(user)));
}
Game.prototype = Object.create({
    assignRoles: function assignRoles() {
        var roles = [role.sheriff, role.outlaw, role.outlaw, role.renegade];
        if (this.players.length >= 5) roles.push(role.deputy);
        if (this.players.length >= 6) roles.push(role.outlaw);
        if (this.players.length >= 7) roles.push(role.deputy);
        this.players.forEach((player) => {
            player.role = roles.splice((Math.random() * roles.length)|0, i);
        });
    }
});

function Player(user) {
    this.user = user;
}
Player.prototype = Object.create({
    get range() {},
    get life() {},
    get maxLife() {},
    get maxShots() {},
});

function Character(name) {
    this.name = name;
}
var characters = [
    new Character("Bard Cassidy"),
    new Character("Black Jack"),
    new Character("Calamity Janet"),
    new Character("El Gringo"),
    new Character("Jesse Jones"),
    new Character("Jourdonnais"),
    new Character("Kit Carlson"),
    new Character("Lucky Duke"),
    new Character("Paul Regret"),
    new Character("Pedro Ramirez"),
    new Character("Rose Doolan"),
    new Character("Sid Ketchum"),
    new Character("Slab the Killer"),
    new Character("Suzy Lafayette"),
    new Character("Vulture Sam"),
    new Character("Willy the Kid")
];

function Role() {

}
var role = {
    sheriff: new Role(),
    deputy: new Role(),
    outlaw: new Role(),
    renegade: new Role()
};

function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;
}

function Action() {

}

function Hand() {

}

function Table() {

}

function Turn() {

}

var characterPile = [];
var cardPile = [];
var discardedPile = [];

var cardColors = {
    black: 'black',
    red: 'red'
}
var cardRanks = ['ace', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'jack', 'queen', 'king'];
var cardSuits = {
    spades: {
        color: cardColors.black
    },
    clovers: {
        color: cardColors.black
    },
    hearts: {
        color: cardColors.red
    },
    diamonds: {
        color: cardColors.red
    }
}

module.exports = {
    Game: Game
};
