var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc');

function Step(turn) {
    log(this.constructor.name + 'ing');
    this.game = turn.game;
    this.phase = turn.phase;
    this.turn = turn;
    this.player = turn.player;
}
// Specifically overriding step prototype so it doesn't have a constructor
Step.prototype = {
    start: function() {},
    actionsFor: function(player) {},
    handleAction: function(player) {},
    end: function() {}
};

function Draw(turn) {
    Step.call(this, turn);
    this.draw = 0;
}
misc.merge(Draw.prototype, Step.prototype, {
    actionsFor: function(player) {
        if (this.player !== player) return {};
        if (this.draw >= this.player.stat('draw')) return {};
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
        if (this.draw >= this.player.stat('draw')) this.turn.goToNextStep();
    }
});

function Play(turn) {
    Step.call(this, turn);
    this.bangs = 0;
}
misc.merge(Play.prototype, Step.prototype, {
    actionsFor: function(player) {
        if (this.event) return this.event.actionsFor(player);
        else {
            if (this.player !== player) return {};
            var acts = {};
            acts[actions.endTurn] = [actions.endTurn];
            acts[actions.play] = this.player.hand
                .filter(card => card.onPlay)
                .map(card => card.id);
            return acts;
        }
    },
    handleAction: function(player, msg) {
        if (this.event) this.event.handleAction(player, msg);
        else {
            if (this.player !== player) return;
            if (msg.action === actions.endTurn) {
                this.turn.goToNextStep();
            } else if (msg.action === actions.play) {
                var card = this.player.hand.find(card => card.id === msg.arg);
                if (card && card.onPlay) card.onPlay(this);
            }
        }
    }
});

function Discard(turn) {
    Step.call(this, turn);
}
misc.merge(Discard.prototype, Step.prototype, {
    start: function() {
        if (!this.player.hand.isTooLarge) this.turn.goToNextStep();
    },
    actionsFor: function(player) {
        if (this.player !== player) return {};
        if (!this.player.hand.isTooLarge) return {};
        var acts = {};
        acts[actions.discard] = this.player.hand.map(card => card.id);
        return acts;
    },
    handleAction: function(player, msg) {
        if (this.player !== player) return;
        if (msg.action === actions.discard) this.player.hand.discard(msg.arg);
        if (!this.player.hand.isTooLarge) this.turn.goToNextStep();
    }
});

Draw.nextStep = Play;
Play.nextStep = Discard;
module.exports = {
    Draw: Draw,
    Play: Play,
    Discard: Discard
};