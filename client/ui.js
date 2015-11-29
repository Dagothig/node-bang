function one() {
    if (arguments[0].querySelector) return arguments[0].querySelector(arguments[1]);
    else return document.body.querySelector(arguments[0]);
}
function many() {
    if (arguments[0].querySelectorAll) return arguments[0].querySelectorAll(arguments[1]);
    else return document.body.querySelectorAll(arguments[0]);
}
function show() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg.length) show.apply(this, arg);
        else if (arg.classList) arg.classList.remove('hidden');
    }
}
function hide() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg.length) hide.apply(this, arg);
        else if (arg.classList) arg.classList.add('hidden');
    }
}
module.exports = {
    one: one,
    many: many,
    show: show,
    hide: hide
};
