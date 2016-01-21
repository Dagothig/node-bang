var misc = aReq('server/misc'),
    log = aReq('server/log');

function Turn(game, player) {
    this.game = game;
    this.phase = game.phase;
    this.player = player;

    log('It is', this.player.user.name + "'s turn");
    this.goToNextStep();
}
misc.merge(Turn.prototype, {
    goToNextStep: function() {
        if (this.step) this.step.end();
        this.step = this.getNextStep();
        if (this.step) this.step.start();
        else this.phase.goToNextTurn(this.game);

    },
    getNextStep: function() {
        var nextStep = !this.step ?
            Turn.steps.Draw :
            this.step.constructor.nextStep;
        if (nextStep) return new nextStep(this);
        return null;
    },

    actionsFor: function(player) {
        if (!this.step) return {};
        return this.step.actionsFor(player);
    },
    handleAction: function(player, msg) {
        if (!this.step) return;
        this.step.handleAction(player, msg);
    }
});
Turn.steps = aReq('server/game/steps');

module.exports = Turn;