function shuffle(arr) {
    for (var i = 0; i < arr.length; i++) {
        var ri = (Math.random() * arr.length)|0;
        swap(arr, i, ri);
    }
    return arr;
}

function swap(arr, i1, i2) {
    var obj = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = obj;
}

function rand(arr) {
    return arr[(Math.random() * arr.length)|0];
}
function spliceRand(arr) {
    return arr.splice((Math.random() * arr.length)|0, 1)[0];
}

function remove(arr, e) {
    var index = arr.indexOf(e);
    if (index < 0 || index >= arr.length) return;
    return arr.splice(index, 1)[0];
}

function filterFrom(arr, e, step, filter) {
    var i = arr.indexOf(e);
    for (n = 1; n < arr.length; n++) {
        var next = (i + n * step) % arr.length;
        while (next < 0) next += arr.length;
        if (!filter || filter(arr[next], next)) return arr[next];
    }
}
after = (arr, e, filter) => filterFrom(arr, e, 1, filter);
before = (arr, e, filter) => filterFrom(arr, e, -1, filter);

function fromArrays() {
    var arr = [];
    Array.from(arguments).forEach(arg => Array.prototype.push.apply(arr, arg));
    return arr;
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
function capitalize(str) {
    return str[0] + str.substring(1);
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

function extend(source, dest) {
    dest.prototype = Object.create(source.prototype);
    dest.prototype.constructor = dest;
    var args = [dest.prototype].concat(Array.from(arguments).slice(2));
    return merge.apply(this, args);
}

function bounded(value, min, max, minExclusive, maxExclusive) {
    return (minExclusive ? value > min : value >= min)
        && (maxExclusive ? value < max : value <= max);
}

module.exports = {
    shuffle: shuffle,
    swap: swap,
    rand: rand,
    spliceRand: spliceRand,
    remove: remove,
    after: after,
    before: before,
    fromArrays: fromArrays,
    gen: gen,
    strTimes: strTimes,
    prepad: prepad,
    postpad: postpad,
    capitalize: capitalize,
    simpleTime: simpleTime,
    merge: merge,
    extend: extend,
    bounded: bounded
};