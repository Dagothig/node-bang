var ui = require('./ui'),
    misc = require('./misc');

let urlRegex = /(?!mailto:)(?:(?:http|https|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:(\/|\?|#)[^\s]*)?/gi;

function resizeBase64(data, maxArea, onFinished) {
    let img = new Image();
    img.onload = () => {
        let area = img.width * img.height;
        let ratio = Math.min(1, Math.sqrt(maxArea / area));

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        onFinished(canvas.toDataURL('image/jpg', 0.8));
    };
    img.src = data;
}

module.exports = function(onMessage, onImage) {
    var element = ui.one('#lobby'),
        usersList = ui.one(element, '.users'),
        messagesList = ui.one(element, '.messages'),
        messageForm = ui.one(element, 'form'),
        message = ui.one(messageForm, '[name=message]');

    messageForm.onsubmit = function() {
        onMessage(message.value);
        message.value = '';
        return false;
    };
    message.onpaste = function(event) {
        let items = event.clipboardData.items;
        for (let index in items) {
            let item = items[index];
            if (item.kind === 'file') {
                let blob = item.getAsFile();
                let reader = new FileReader();
                reader.onload = ev => resizeBase64(
                    ev.target.result,
                    480 * 480,
                    data => onImage(data)
                );
                reader.readAsDataURL(blob);
            }
        }
    };

    return {
        element: element,
        usersList: usersList,
        messagesList: messagesList,
        messageForm: messageForm,
        message: message,

        handleUsers: function(current, users) {
            if (!users) return usersList.innerHTML = '';

            function surroundWith(tag, clazz, obj) {
                return '<' + tag + ' class="' + clazz + '">' +
                        obj +
                    '</' + tag + '>';
            }
            function getTag(user) {
                var tag = user.name
                if (misc.isCurrent(current, user))
                    tag = surroundWith('em', '', tag);
                return surroundWith('div', '', tag);
            }
            var html = '';
            users
                .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .forEach((user) => html += getTag(user));
            usersList.innerHTML = html;
        },
        handle: function(name) {
            let msgDiv = ui.create('div');
            ui.create('em', '', msgDiv).textContent = name;
            messagesList.insertBefore(msgDiv, messagesList.firstChild);
            return msgDiv;
        },
        handleMessage: function(name, msg) {
            let msgDiv = this.handle(name);
            let prev = 0, result = { 0: '', index: 0 };
            while ((result = urlRegex.exec(msg)) !== null) {
                msgDiv.appendChild(document.createTextNode(msg.substring(
                    prev, result.index
                )));
                msgDiv.appendChild(ui.create('a', {
                    href: result[0],
                    text: result[0],
                    target: 'blank'
                }));
                prev = result.index + result[0].length;
            }
            msgDiv.appendChild(document.createTextNode(msg.substring(prev)));
        },
        handleImage: function(name, data) {
            this.handle(name).appendChild(ui.create('img', { src: data }));
        },
        handleError: function(msg) {
            let errDiv = ui.create('div', 'error');
            errDiv.textContent = msg;
            messagesList.insertBefore(errDiv, messagesList.firstChild);
        }
    };
};
