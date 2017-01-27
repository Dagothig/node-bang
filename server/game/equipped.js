const misc = aReq('server/misc');

module.exports = function Equipped(game, player, cards) {
    return misc.merge([], {
        stat: function(stat) {
            return this.reduce((sum, equipment) => {
                return sum + (equipment[stat]|0);
            }, 0);
        },
        remove: function(cardId) {
            var index = this.indexOf(this.find(card => card.id === cardId));
            return (index >= 0 && index < this.length) ?
                this.splice(index, 1)[0] : null;
        },
        discard: function(cardId) {
            if (!arguments.length) {
                let discarded = this.slice();
                this.length = 0;
                cards.discarded.push.apply(cards.discarded, discarded);
                game.onGameEvent({
                    name: 'discard',
                    from: 'equipped',
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
                    from: 'equipped',
                    player: player.name,
                    card: card.format()
                });
            }
        }
    });
}