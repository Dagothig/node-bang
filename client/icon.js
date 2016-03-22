var ui = require('./ui'),
    misc = require('./misc');

module.exports = (iconHrefs, titles, flashTime) => ({
    _i: 0,

    icon: ui.one(document, 'link[rel=icon]'),
    flashing: false,
    lighted: false,
    interval: null,

    light: function(lighted) {
        this.lighted = lighted;
        if (!this.lighted) this._i = 0;
        else if (this.lighted) this._i++;
        this.icon.href = iconHrefs[this._i % iconHrefs.length] + '?ver=1.' + this._i;
        document.title = titles[this._i % titles.length];
    },
    flash: function(flashing) {
        this.flashing = flashing;
        if (this.flashing && !this.interval) {
            this.light(true);
            this.interval = setInterval(() => this.light(true), flashTime);
        } else if (!this.flashing && this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.light(false);
        }
    }
});