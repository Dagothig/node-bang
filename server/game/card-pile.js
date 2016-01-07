var misc = aReq('server/misc'),
    log = aReq('server/log');

function CardPile(cards) {
    this._backing = misc.shuffle(cards);
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
                continue;
            }
            cards.push(card);
            amount--;
        }
        return cards;
    }
});

module.exports = CardPile;