function Choice(action, args, argFunc) {
    this.action = action;
    this.args = args || [this.action];
    this.argFunc = argFunc || (a => a);
    this.mapped = this.args.map(this.argFunc);
}
Choice.prototype = {
    constructor: Choice,
    is: function(msg) { return this.action === msg.action; }
};
module.exports = Choice;