module.exports = {
    characters: {
        "Bart Cassidy": {
            life: 4,
            description: "Each time he is hit, he draws a card."
        },
        "Black Jack": {
            life: 4,
            description: "He shows the second card he draws. On heart or Diamonds, he draws one more card."
        },
        "Calamity Janet": {
            life: 4,
            description: "She can play BANG! cards as Missed! cards and vice versa."
        },
        "El Gringo": {
            life: 3,
            description: "Each time he is hit by a player, he draws a card from the hand of that player."
        },
        "Jesse Jones": {
            life: 4,
            description: "He may draw his first card from the hand of a player."
        },
        "Jourdonnais": {
            life: 4,
            description: "Whenever he is the target of a BANG!, he may draw! on a Heart, he is missed."
        },
        "Kit Carlson": {
            life: 4,
            description: "He looks at the top three cards of the deck and chooses one to put back on top."
        },
        "Lucky Duke": {
            life: 4,
            description: "Each time he \"draws!\", he flips the top two cards and chooses one."
        },
        "Paul Regret": {
            life: 3,
            description: "All players see him at a distance increased by 1."
        },
        "Pedro Ramirez": {
            life: 4,
            description: "He may draw his first card from the discard pile."
        },
        "Rose Doolan": {
            life: 4,
            description: "She sees all players at a distance decreased by 1."
        },
        "Sid Ketchum": {
            life: 4,
            description: "He may discard 2 cards to regain one life point."
        },
        "Slab the Killer": {
            life: 4,
            description: "Player needs 2 Missed! cards to cancel his BANG! card."
        },
        "Suzy Lafayette": {
            life: 4,
            description: "As soon as she has no cards in her hand, she draws a card from the draw pile."
        },
        "Vulture Sam": {
            life: 4,
            description: "Whenever a player is eliminated from play, he takes in hand all the cards of that player."
        },
        "Willy the Kid": {
            life: 4,
            description: "He can play any number of Bang! cards."
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
            description: "\"Draw!\" at the start of your turn and discard the jail. If it's not hearts skip your turn.",
            type: "blue"
        },
        dynamite: {
            name: "Dynamite",
            description: "\"Draw!\" at the start of your turn. If it is a 2-9 of spades lose 3 life points. Else pass the Dynamite on your left.",
            type: "blue"
        },
        barile: {
            name: "Barile",
            description: "\"Draw!\" when you are the target of a BANG! On hearts, the attack misses.",
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
            type: "brown",
            description: "Regain a life point"
        },
        panico: {
            name: "Panico",
            type: "brown",
            range: 1,
            draw: 1
        },
        catbalou: {
            name: "Cat Balou",
            type: "brown",
            description: "Force a player to discard a card."
        },
        diligenza: {
            name: "Diligenza",
            type: "brown",
            draw: 2
        },
        wellsfargo: {
            name: "Wells Fargo",
            type: "brown",
            draw: 3
        },
        gatling: {
            name: "Gatling",
            type: "brown",
            description: "All other players are the target of a BANG!"
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
            description: "Each player regains 1 life point.",
            type: "brown"
        }
    }
};