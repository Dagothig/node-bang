var misc = require('./misc');

module.exports = {
    str: {
        toStr: str => (str + ''),
        fromStr: str => str
    },
    num: {
        fromStr: str => new Number(str).valueOf()
    },
    bool: {
        fromStr: str => str === 'true',
    },

    read: function(key, conf) {
        var stored = localStorage.getItem(key);
        return (stored && this[conf[1] || 'str'].fromStr(stored)) || conf[0];
    },
    write: function(key, conf, value) {
        localStorage.setItem(key, (this[conf[1] || 'str'].toStr || this.str.toStr)(value));
        return value;
    }
};