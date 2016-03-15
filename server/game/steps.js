var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    events = aReq('server/game/events'),
    handles = aReq('server/game/handles');

function Step(turn) {
    this.game = turn.game;
    this.phase = turn.phase;
    this.turn = turn;
    this.player = turn.player;
    this.event = null;
    this.onResolved = event => event ?
        (this.event = event) :
        this.turn.goToNextStep();
}
Step.prototype = {
    constructor: Step,
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

function Draw(turn) { Step.call(this, turn); }
Draw.prototype = misc.merge(Object.create(Step.prototype), {
    constructor: Draw,
    start: function() { this.handleBeforeDraw(); },
    handleBeforeDraw: function() {
        handles.event('beforeDraw',
            this.game.players.filter(p => p.alive), [this],
            // onFollowing
            () => this.handleDraw(),
            // onResolved
            this.onResolved
        );
    },
    handleDraw: function() {
        this.onResolved(events('cardsDraw')(
            this.player, this.phase.cards, 2,
            cards => {
                Array.prototype.push.apply(this.player.hand, cards);
                this.game.onGameEvent({
                    name: 'Draw',
                    player: this.player.name,
                    amount: 2
                });
                this.handleAfterDraw(cards);
            }
        ));
    },
    handleAfterDraw: function(cards) {
        handles.event('afterDraw',
            this.game.players.filter(p => p.alive), [this, cards],
            // onFollowing
            () => this.turn.goToNextStep(),
            // onResolved
            this.onResolved
        );
    }
});

function Play(turn) {
    Step.call(this, turn);
    this.bangs = 0;
    this.baseOnResolved = this.onResolved;
    this.onResolved = event => event ?
        (this.event = event) :
        this.handleAfterPlay();
}
Play.prototype = misc.merge(Object.create(Step.prototype), {
    constructor: Play,
    start: function() { this.handleBeforePlay(); },
    handleBeforePlay: function() {
        handles.event('beforePlay',
            this.game.players.filter(p => p.alive), [this],
            // onFollowing
            () => this.onResolved(events('cardChoice')(
                this.player, this.player.hand.filter(c => c.filter(this)),
                // onPlay
                card => card.handlePlay(this, this.onResolved),
                // onCancel
                () => this.turn.goToNextStep()
            )),
            // onResolved
            this.onResolved
        );
    },
    handleAfterPlay: function() {
        handles.event('afterPlay',
            this.game.players.filter(p => p.alive), [this],
            // onFollowing
            () => this.handleBeforePlay(),
            // onResolved
            this.onResolved
        );
    }
});

function Discard(turn) { Step.call(this, turn); }
Discard.prototype = misc.merge(Object.create(Step.prototype), {
    constructor: Discard,
    start: function() {
        if (!this.player.hand.isTooLarge) this.turn.goToNextStep();
        else this.onResolved(events('cardChoice')(
            this.player, this.player.hand,
            // onDiscard
            card => {
                this.player.hand.discard(card.id);
                this.start();
            }
        ));
    }
});

Draw.nextStep = Play;
Play.nextStep = Discard;
module.exports = {
    Draw: Draw,
    Play: Play,
    Discard: Discard
};