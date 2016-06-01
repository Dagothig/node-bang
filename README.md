# node-bang
Node server for playing [Bang!](https://en.wikipedia.org/wiki/Bang!_%28card_game%29) games.

Running should be relatively straightforward: npm install and gulp (assuming it is installed) should do the trick; the entry point of the server is server.js, in the case it is running with node directly (instead of through gulp).

This is based on the rules and cards of the vanilla game; so there are no extra cards or characters present only in the expansions (if there are, then it's a bug).

A version of the game is currently up on [my ever-so-dubious website](http://bang.dagothig.com/).

As of now the game is fully implemented and supports disconnects and things of the such; while it's missing a handful of quality of life changes, it's mostly functional.

The constants of the file server/consts.js can be overriden by giving the snake-case arguments corresponding to the constants:  
For instance, the minimum amount of players can be changed to 6 by passing the argument --min-players=6 when running the node server (this also works when running through gulp).  
A sample command could be:  
node server --min-players=6 --game-start-timer=30 --character-choices=3
