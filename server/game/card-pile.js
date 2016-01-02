var misc = aReq('server/misc');

function CardPile(cards) {
    this._backing = misc.shuffle(cards);
    this.discarded = [];
}
CardPile.prototype = Object.create({
    take: function take(amount) {
        amount = amount ||  1;
        var cards = [];
        while (amount > 0) {
            var card = this._backing.pop();
            if (!card) {
                this._backing = misc.shuffle(this.discarded);
                this.discarded = [];
            }
            cards.push(card);
        }
    }
});