module.exports = {
    characters: {
        "Bart Cassidy": {
            life: 4,
            description: "Each time he loses a life point, he immediately draws a card from the deck."
        },
        "Black Jack": {
            life: 4,
            description: "During phase 1 of his turn, he must show the second card he draws: if it’s Heart or Diamonds (just like a 'draw!'), he draws one additional card (without revealing it)."
        },
        "Calamity Janet": {
            life: 4,
            description: "She can play BANG! cards as Missed! cards and vice versa. If she plays a Missed! as a BANG!, she cannot play another BANG! card that turn (unless she has a Volcanic in play)."
        },
        "El Gringo": {
            life: 3,
            description: "Each time he loses a life point due to a card played by another player, he draws a random card from the hands of that player (one card for each life point). If that player has no more cards, too bad!, he does not draw. Note that Dynamite damages are not caused by any player."
        },
        "Jesse Jones": {
            life: 4,
            description: "During phase 1 of his turn, he may choose to draw the first card from the deck, or randomly from the hand of any other player. Then he draws the second card from the deck."
        },
        "Jourdonnais": {
            life: 4,
            description: "Whenever he is the target of a BANG!, he may \"draw!\": on a Heart, he is missed."
        },
        "Kit Carlson": {
            life: 4,
            description: "During phase 1 of his turn, he looks at the top three cards of the deck: he chooses 2 to draw, and puts the other one back on the top of the deck, face down."
        },
        "Lucky Duke": {
            life: 4,
            description: "Each time he is required to \"draw!\" he flips the top two cards from the deck, and chooses the result he prefers. Discard both cards afterwards."
        },
        "Paul Regret": {
            life: 3,
            description: "He is considered to have a Mustang in play at all times; all other players must add 1 to the distance to him. If he has another real Mustang in play, he can count both of them, increasing all distances to him by a total of 2."
        },
        "Pedro Ramirez": {
            life: 4,
            description: "During phase 1 of his turn, he may choose to draw the first card from the top of the discard pile or from the deck. Then he draws the second card from the deck."
        },
        "Rose Doolan": {
            life: 4,
            description: "She is considered to have a Mirino in play at all times; she sees the other players at a distance decreased by 1. If she has another real Scope in play, she can count both of them, reducing her distance to all other players by a total of 2."
        },
        "Sid Ketchum": {
            life: 4,
            description: "At any time, he may discard 2 cards from his hand to regain one life point. If he is willing and able, he can use this ability more than once at a time."
        },
        "Slab the Killer": {
            life: 4,
            description: "Players trying to cancel his BANG! cards need to play 2 Missed!. The Barrel effect, if successfully used, only counts as one Missed!"
        },
        "Suzy Lafayette": {
            life: 4,
            description: "As soon as she has no cards in her hand, she draws a card from the draw pile."
        },
        "Vulture Sam": {
            life: 4,
            description: "Whenever a character is eliminated from the game, Sam takes all the cards that player had in his hand and in play, and adds them to his hand."
        },
        "Willy the Kid": {
            life: 4,
            description: "He can play any number of \"Bang!\" cards."
        }
    },
    roles: {
        "Sheriff": {
            name: "Sceriffo",
            description: "Kill all the Outlaws and the Renegade!"
        },
        "Deputy": {
            name: "Vice",
            description: "Protect the Sheriff! Kill all the Outlaws and the Renegade!"
        },
        "Outlaw": {
            name: "Fuorilegge",
            description: "Kill the Sheriff!"
        },
        "Renegade": {
            name: "Rinnegato",
            description: "Be the last one in play!"
        }
    },
    "cards": {
        prigione: {
            name: "Prigione",
            description: "\"Draw!\" at the beginning of your turn. If the \"drawn!\" card is a hearts discard the jail, play normally. Else discard the jail and skip your turn.",
            type: "blue"
        },
        dynamite: {
            name: "Dynamite",
            description: "\"Draw!\" at the beginning of your turn. If the \"drawn!\" card is a 2-9 of spades lose 3 life points. Else pass the Dynamite on your left.",
            type: "blue"
        },
        barile: {
            name: "Barile",
            description: "\"Draw!\" when you are attacked by cards with BANG! symbols. If it is a heart, then the attack misses.",
            type: "blue"
        },
        mirino: {
            name: "Mirino",
            description: "You view others at distance -1.",
            type: "blue"
        },
        mustang: {
            name: "Mustang",
            description: "Others view you at distance +1.",
            type: "blue"
        },
        volcanic: {
            name: "Volcanic",
            description: "You can play any number of BANG!",
            range: 1,
            type: "blue"
        },
        schofield: {
            name: "Schofield",
            range: 2,
            type: "blue"
        },
        remington: {
            name: "Remington",
            range: 3,
            type: "blue"
        },
        carabine: {
            name: "Carabine",
            range: 4,
            type: "blue"
        },
        winchester: {
            name: "Winchester",
            range: 5,
            type: "blue"
        },

        bang: {
            name: "Bang",
            type: "brown"
        },
        mancato: {
            name: "Mancato",
            type: "brown"
        },
        beer: {
            name: "Birra",
            type: "brown"
        },
        panico: {
            name: "Panico",
            type: "brown"
        },
        catbalou: {
            name: "Cat Balou",
            type: "brown"
        },
        diligenza: {
            name: "Diligenza",
            type: "brown"
        },
        wellsfargo: {
            name: "Wells Fargo",
            type: "brown"
        },
        gatling: {
            name: "Gatling",
            type: "brown"
        },
        indians: {
            name: "Indians!",
            type: "brown",
            description: "All other players discard a BANG! or lose 1 life point."
        },
        duel: {
            name: "Duello",
            type: "brown",
            description: "A target player discards a BANG!, then you, etc. First player failing to discard a BANG! loses 1 life point."
        },
        emporio: {
            name: "Emporio",
            description: "Reveal as many cards as players. Each player draws one.",
            type: "brown"
        },
        saloon: {
            name: "Saloon",
            type: "brown"
        }
    }
};