var misc = require('./misc');

module.exports = {
    str: {
        toStr: str => (str + ''),
        fromStr: str => str
    },
    num: {
        toStr: num => (num + ''),
        fromStr: str => new Number(str).valueOf()
    },
    bool: {
        toStr: val => val ? 'true' : 'false',
        fromStr: str => str === 'true',
    },

    read: function(key, conf) {
        var stored = localStorage.getItem(key);
        return stored !== null ? this[conf[1] || 'str'].fromStr(stored) : conf[0];
    },
    write: function(key, conf, value) {
        localStorage.setItem(key, this[conf[1] || 'str'].toStr(value));
        return value;
    }
};