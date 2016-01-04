var actions = aReq('server/actions');

function Step(turn) {
    this.game = turn.game;
    this.phase = turn.phase;
    this.turn = turn;
    this.player = turn.player;
}

function Draw(turn) {
    Step.call(this, turn);
    this.draw = 0;
}
Draw.prototype = Object.create({
    get drawMax() {
        return this.player.stat('draw')
    },
    actionsFor: function(player) {
        if (this.player !== player) return {};
        if (this.draw >= this.drawMax) return {};
        var acts = {};
        acts[actions.draw] = ['pile'];
        return acts;
    },
    handleAction: function(player, msg) {
        if (this.player !== player) return;
        if (msg.action === actions.draw) {
            if (msg.arg === 'pile') {
                this.player.hand.drawFromPile(1);
                this.draw++;
            }
        }
        if (this.draw >= this.drawMax) this.turn.goToNextStep();
    }
});

function Play(turn) {
    Step.call(this, turn);
}

function Discard(turn) {
    Step.call(this, turn);
}

Draw.nextStep = Play;
Play.nextStep = Discard;
module.exports = {
    Draw: Draw,
    Play: Play,
    Discard: Discard
};