'use strict';

var log = aReq('server/log'),
    actions = aReq('server/actions'),
    misc = aReq('server/misc'),
    events = aReq('server/game/events'),
    handles = aReq('server/game/handles');

function Step(game, player, onFinished) {
    this.game = game;
    this.phase = game.phase;
    this.player = player;
    this.onFinished = onFinished;
    this.event = null;
    this.onResolved = event =>
        this.changeEvent(event, () => this.finalize());
}
Step.prototype = {
    constructor: Step,
    get name() {
        return this.constructor.name;
    },
    changeEvent: function(event, onNull) {
        var zombies = this.game.players.filter(p => p.zombie);
        this.event = event;
        if (event) zombies.forEach(zombie => event.handleDefault(zombie));
        else {
            if (zombies.length > 0) this.kill(zombies.pop());
            else onNull();
        }
    },
    format: function(player) {
        return {
            name: this.name,
            event: (this.event && this.event.format) ?
                this.event.format(player) : undefined
        };
    },
    start: function() {},
    update: function(delta) {
        return this.event && this.event.update(delta);
    },
    actionsFor: function(player) {
        if (this.event) return this.event.actionsFor(player);
    },
    handleAction: function(player, msg) {
        return this.event && this.event.handleAction(player, msg);
    },
    handleDisconnect: function(zombie) {
        if (this.event) this.event.handleDefault(zombie);
        else this.kill(zombie);
    },
    kill: function(zombie, onResolved) {
        onResolved = onResolved || this.onResolved;
        zombie.life = 0;
        handles.beforeDeath(this, zombie, zombie, 0, onResolved);
    },
    end: function() {},
    finalize: function() {
        let zombies = this.game.players.filter(p => p.zombie);
        if (!zombies.length) return this.onFinished();
        this.kill(zombies.pop(), e => this.changeEvent(e, () => this.finalize()));
    }
};

function Draw() { Step.apply(this, arguments); }
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
                let specific = {
                    name: 'draw',
                    from: 'pile',
                    player: this.player.name,
                    cards: cards.map(card => card.format())
                };
                let unspecific = {
                    name: 'draw',
                    from: 'pile',
                    player: this.player.name,
                    amount: 2
                };
                this.game.onGameEvent(p =>
                    p === this.player ? specific : unspecific
                );
                this.handleAfterDraw(cards);
            }
        ));
    },
    handleAfterDraw: function(cards) {
        handles.event('afterDraw',
            this.game.players.filter(p => p.alive), [this, cards],
            // onFollowing
            () => this.finalize(),
            // onResolved
            this.onResolved
        );
    }
});

function Play() {
    Step.apply(this, arguments);
    this.bangs = 0;
    this.onResolved = event =>
        this.changeEvent(event, () => this.handleAfterPlay());
}
Play.prototype = misc.merge(Object.create(Step.prototype), {
    constructor: Play,
    start: function() { this.handleBeforePlay(); },
    handleBeforePlay: function() {
        handles.event('beforePlay',
            this.game.players.filter(p => p.alive), [this],
            // onFollowing
            () => this.onResolved(events('cardChoice')(this.player,
                this.player.hand.filter(c => c.filter(this)),
                // onPlay
                card => card.handlePlay(this, this.onResolved),
                // onCancel
                misc.merge(() => this.finalize(), { arg: 'end turn'}),
                // format
                player => ({
                    for: 'play'
                })
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

function Discard() { Step.apply(this, arguments); }
Discard.prototype = misc.merge(Object.create(Step.prototype), {
    constructor: Discard,
    start: function() {
        if (!this.player.hand.isTooLarge) this.finalize();
        else this.onResolved(events('cardChoice')(
            this.player, this.player.hand,
            // onDiscard
            card => {
                this.player.hand.discard(card.id);
                this.start();
            },
            // onCancel
            null,
            // format
            player => ({
                for: 'discard'
            })
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