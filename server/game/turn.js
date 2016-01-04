function Turn(game, player) {
    this.game = game;
    this.phase = game.phase;
    this.player = player;
    this.goToNextStep();
}
Turn.prototype = Object.create({
    goToNextStep: function() {
        this.step = this.getNextStep();
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
        return this.step.handleAction(player, msg);
    }
});
Turn.steps = aReq('server/game/steps');

module.exports = Turn;