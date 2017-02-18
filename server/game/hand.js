const misc = aReq('server/misc'),
    Card = aReq('server/game/cards/card');

module.exports = function Hand(game, player, cards) {
    return misc.merge(cards.draw(player.stat('initCards')), {
        drawFromPile: function(amount) {
            this.add(cards.draw(amount || 1), { from: 'pile' });
        },
        // We also accept visible as being a function; we must thus check visible specifically against true
        add: function(drawn, extra = {}, visible = false) {
            if (drawn instanceof Card) return this.add([drawn], extra, visible);
            drawn.forEach(card => this.push(card));
            let specific = misc.merge({
                name: 'draw',
                player: player.name,
                cards: drawn.map(c => c.format())
            }, extra);
            if (visible === true) game.onGameEvent(specific);
            else {
                let unspecific = misc.merge({
                    name: 'draw',
                    player: player.name,
                    amount: drawn.length
                }, extra);
                if (visible === false) visible = p => p === player;
                game.onGameEvent(p => visible(p) ? specific : unspecific);
            }
        },
        remove: function(cardId) {
            var index = this.indexOf(this.find(card => card.id === cardId));
            return (index >= 0 && index < this.length) ?
                this.splice(index, 1)[0] : null;
        },
        removeRand: function() { return misc.spliceRand(this); },
        discard: function(cardId) {
            if (!arguments.length) {
                let discarded = this.slice();
                this.length = 0;
                cards.discarded.push.apply(cards.discarded, discarded);
                game.onGameEvent({
                    name: 'discard',
                    from: 'hand',
                    player: player.name,
                    cards: discarded.map(c => c.format())
                });
                return;
            }

            var card = this.remove(cardId);
            if (card) {
                cards.discarded.push(card);
                game.onGameEvent({
                    name: 'discard',
                    from: 'hand',
                    player: player.name,
                    card: card.format()
                });
            }
        },
        get cardMax() { return player.life; },
        get cardCount() { return player.hand ? player.hand.length : 0; },
        get isTooLarge() { return this.cardCount > this.cardMax; }
    });
}