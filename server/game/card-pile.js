var misc = aReq('server/misc'),
    log = aReq('server/log');

function CardPile(game, cards) {
    this._backing = misc.shuffle(cards);
    this.game = game;
    this.discarded = [];
}
misc.merge(CardPile.prototype, {
    draw: function draw(amount) {
        amount = amount ||  1;
        var cards = [];
        while (amount > 0) {
            var card = this._backing.pop();
            if (!card) {
                log('Reshuffling deck');
                this._backing = misc.shuffle(this.discarded);
                this.discarded = [];
                // When a reshuffle hapens, then we didn't have enough cards, so we drew cards.length many cards so far from pile, and the reshuffled pile before drawing would've had discarded + cards amount.
                this.game.onGameEvent({
                    name: 'reshuffling',
                    pile: this.length + cards.length
                });
                continue;
            }
            cards.push(card);
            amount--;
        }
        return cards;
    },
    push: function push() {
        this._backing.push.apply(this._backing, arguments);
    },
    get length() { return this._backing.length; }
});

module.exports = CardPile;