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

function define(dst, src) {
    for (var key in src) dst[key] = src[key];
    return dst;
}

module.exports = {
    shuffle: shuffle,
    swap: swap,
    define: define
};
