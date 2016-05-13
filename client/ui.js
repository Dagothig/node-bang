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
function findParentBefore(node, before) {
    if (node.parentElement === before) return node;
    return findParentBefore(node.parentElement, before);
}
function create(tagName, className, parent) {
    var tag = document.createElement(tagName);
    if (className) tag.className = className;
    if (parent) parent.appendChild(tag);
    return tag;
}
function move(tag, x, y, z) {
    tag.style.left = x + 'px';
    tag.style.top = y + 'px';
    tag.style.zIndex = z;
}

module.exports = {
    one: one,
    many: many,
    show: show,
    hide: hide,
    findParentBefore: findParentBefore,
    create: create,
    move: move
};
