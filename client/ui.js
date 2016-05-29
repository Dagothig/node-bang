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
shake.time = 200;
shake.max = 24;
function shake(tag) {
    let time = shake.time;
    let x = 0, y = 0, scale = 1;
    let interval = setInterval(() => {
        scale = shake.max * time / shake.time;
        x = (Math.random() - 0.5) * scale;
        y = (Math.random() - 0.5) * scale;
        tag.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        time -= 10;
        if (time <= 0) {
            clearInterval(interval);
            tag.style.transform = '';
        }
    }, 10);
}

module.exports = {
    one: one,
    many: many,
    show: show,
    hide: hide,
    findParentBefore: findParentBefore,
    create: create,
    move: move,
    shake: shake
};
