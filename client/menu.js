var ui = require('./ui'),
    misc = require('./misc');

module.exports = function(settings, onDisconnect) {
    var element = ui.one('#menu'),
        list = ui.one(element, '.list');

    var settingsTitle = document.createElement('div');
    settingsTitle.innerHTML = '<em>Settings</em>';
    list.appendChild(settingsTitle);

    settings.all
        .filter(n => settings['_' + n + 'Conf'][2] === 'user')
        .forEach(key => {
            list.app

            var container = document.createElement('div');
            container.className = 'flex horizontal';

            var name = 'menu' + misc.capitalize(key);

            var label = document.createElement('label');
            label.setAttribute('for', name);
            label.className = 'grow-1 center';
            label.innerHTML = misc.spacize(key);
            container.appendChild(label);

            var checkboxContainer = document.createElement('span');
            checkboxContainer.className = 'center';

            var checkbox = document.createElement('input');
            checkbox.id = name;
            checkbox.name = name;
            checkbox.type = 'checkbox';
            checkboxContainer.appendChild(checkbox);

            var check = document.createElement('label');
            check.setAttribute('for', name);
            check.className = 'check fa fa-check';
            checkboxContainer.appendChild(check);

            container.appendChild(checkboxContainer);
            list.appendChild(container);

            settings.bind(key, val => checkbox.checked = val);
            checkbox.onchange = function(e) {
                if (settings[key] !== checkbox.checked)
                    settings[key] = checkbox.checked;
            }
        });

    var disconnectContainer = document.createElement('div');
    var disconnect = document.createElement('a');
    disconnect.href = "#";
    disconnect.innerHTML = 'Disconnect';
    disconnect.onclick = () => onDisconnect();
    disconnectContainer.appendChild(disconnect);
    list.appendChild(disconnectContainer);

    var sourceContainer = document.createElement('div');
    var source = document.createElement('a');
    source.href = 'http://github.com/dagothig/node-bang';
    source.innerHTML = 'Source';
    source.target = 'blank';
    sourceContainer.appendChild(source);
    list.appendChild(sourceContainer);

    return {
        element: element,
        disconnect: disconnect
    };
};