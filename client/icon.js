var ui = require('./ui'),
    misc = require('./misc');

module.exports = (iconHrefs, flashTime) => ({
    _i: 0,

    icon: ui.one(document, 'link[rel=icon]'),
    flashing: false,
    lighted: false,
    interval: null,

    light: function(lighted) {
        this.lighted = lighted;
        if (!this.lighted) this._i = 0;
        else if (this.lighted) this._i = (this._i + 1) % iconHrefs.length;
        this.icon.href = iconHrefs[this._i];
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