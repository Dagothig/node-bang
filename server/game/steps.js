var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    events = aReq('server/game/events'),
    handles = aReq('server/game/cards/handles');

function Step(turn) {
    this.game = turn.game;
    this.phase = turn.phase;
    this.turn = turn;
    this.player = turn.player;
    this.defaultOnResolve = event => this.event = event;
}
// Specifically overriding step prototype so it doesn't have a constructor
Step.prototype = {
    get name() {
        return this.constructor.name;
    },
    format: function() {
        return {
            name: this.name,
            event: (this.event && this.event.format) ?
                this.event.format() : undefined
        };
    },
    start: function() {},
    actionsFor: function(player) {
        if (this.event) return this.event.actionsFor(player);
    },
    handleAction: function(player, msg) {
        if (this.event) return this.event.handleAction(player, msg);
    },
    end: function() {}
};

function Draw(turn) {
    Step.call(this, turn);
    this.defaultOnResolve = event => event ?
        (this.event = event) :
        this.turn.goToNextStep();

    handles.event('beforeDraw',
        this.game.players.filter(p => p.alive),
        [this],
        // onFollowing
        () => this.defaultOnResolve(events.cardsDrawEvent(
            this.player, this.phase.cards, 2,
            cards => {
                Array.prototype.push.apply(this.player.hand, cards);
                this.game.onGameEvent({
                    name: 'Draw',
                    player: this.player.name,
                    amount: 2
                });
                handles.event('afterDraw',
                    this.game.players.filter(p => p.alive),
                    [this, cards],
                    // onFollowing
                    () => this.turn.goToNextStep(),
                    // onResolved
                    this.defaultOnResolve
                );
            }
        )),
        // onResolved
        this.defaultOnResolve
    )
}
misc.extend(Step, Draw);

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
                .filter(card => card.filter(this))
                .map(card => card.id);
            return acts;
        }
    },
    handleAction: function(player, msg) {
        if (this.event) return this.event.handleAction(player, msg);

        if (this.player !== player) return;
        if (msg.action === actions.endTurn) return this.turn.goToNextStep();
        if (msg.action === actions.play) {
            var card = this.player.hand.find(card => card.id === msg.arg);
            if (card && card.filter(this))
                return card.handlePlay(this, this.defaultOnResolve);
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