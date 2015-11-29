function Game(users) {

}

function Player(user) {
    this.user = user;
}
Player.prototype = Object.create({
    get range() {},
    get life() {},
    get maxLife() {},
    get maxShots() {},
});

function Person() {

}

function Role() {

}

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

var cardPile = [];
var discardedPile = [];

var actions = {
    playCard,

};

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
