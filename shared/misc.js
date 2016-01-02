function shuffle(arr) {
    for (var i = 0; i < arr.length; i++) {
        var ri = (Math.random() * arr.length)|0 ;
        swap(arr, i, ri);
    }
    return arr;
}

function swap(arr, i1, i2) {
    var obj = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = obj;
}

function spliceRand(arr) {
    return arr.splice((Math.random() * arr.length)|0, 1).find(() => true);
}

function gen(f, c) {
    var arr = [];
    for (var i = 0; i < c; i++) arr.push(f(i));
    return arr;
}

function strTimes(str, times) {
    var full = '';
    for (var i = 0; i < times; i++) full += str;
    return full;
}
function prepad(str, length, pad) {
    return strTimes(pad, length - (str + '').length) + str;
}
function postpad(str, length, pad) {
    return str + strTimes(pad, length - (str + '').length);
}

function simpleTime(time) {
    time = time || new Date();
    return prepad(time.getHours(), 2, '0')
        + ":"
        + prepad(time.getMinutes(), 2, '0')
        + ":"
        + prepad(time.getSeconds(), 2, '0');
}

function merge(to) {
    Array.from(arguments).slice(1).forEach(src => {
        Object.defineProperties(to, Object.keys(src).reduce((descrs, key) => {
            descrs[key] = Object.getOwnPropertyDescriptor(src, key);
            return descrs;
        }, {}));
    });
    return to;
}

function bounded(value, min, max, minExclusive, maxExclusive) {
    return (minExclusive ? value > min : value >= min)
        && (maxExclusive ? value < max : value <= max);
}

module.exports = {
    shuffle: shuffle,
    swap: swap,
    spliceRand: spliceRand,
    gen: gen,
    strTimes: strTimes,
    prepad: prepad,
    postpad: postpad,
    simpleTime: simpleTime,
    merge: merge,
    bounded: bounded
};