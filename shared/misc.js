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

function define(dst, src) {
    for (var key in src) dst[key] = src[key];
    return dst;
}

function gen(f, c) {
    var arr = [];
    for (var i = 0; i < c; i++) arr.push(f(i));
    return arr;
}

module.exports = {
    shuffle: shuffle,
    swap: swap,
    define: define,
    spliceRand: spliceRand,
    gen: gen
};
