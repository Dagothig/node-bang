function Choice(player, action, args, argFunc) {
    this.player = player;
    this.action = action;
    this.args = args || [this.action];
    this.argFunc = argFunc || (a => a);
    this.mapped = this.args.map(this.argFunc);
}
Choice.prototype = {
    constructor: Choice,
    is: function(player, msg) {
        return this.player.name === player.name
            && this.action === msg.action;
    }
};
module.exports = Choice;