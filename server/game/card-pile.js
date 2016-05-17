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
                this.game.onGameEvent({
                    name: 'reshuffling',
                    pile: this.length,
                    discard: this.discarded.map(c => c.format())
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