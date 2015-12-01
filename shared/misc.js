function shuffle(arr) {
    for (var i = 0; i < arr.length; i++) {
        var ri = Math.floor(Math.random() * arr.length);
        swap(arr, i, ri);
    }
    return arr;
}

function swap(arr, i1, i2) {
    var obj = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = obj;
}

module.exports = {
    shuffle: shuffle,
    swap: swap
};
