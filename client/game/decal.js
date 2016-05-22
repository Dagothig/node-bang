var ui = require('../ui'),
    misc = require('../misc');

function Decal() {
    this.tagRoot = ui.create('div');

    this.emporio = ui.create('div', 'emporio', this.tagRoot);
    this.eventType = ui.create('div', 'event-type', this.tagRoot);
}
Decal.depth = 1;
Decal.prototype = {
    constructor: Decal,

    setInfo: function(game) {
        if (!game.turn) return;
        if (!game.turn.step) return;
        if (!game.turn.step.event) return;

        if (game.turn.step.event.name === 'CardsDrawEvent') {

        }

        if (game.turn.step.event.for === 'emporio') {
            let width = 48;
            this.emporio.style.width = width + 'px';
            this.emporio.style.marginLeft = -width + 'px';
            ui.show(this.emporio);
        } else {
            ui.hide(this.emporio);
        }
    },

    move: function(z) {
        this.tagRoot.style.zIndex = this.z = z;
    }
};

module.exports = Decal;