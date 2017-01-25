var misc = aReq('shared/misc');

function parseArgs(argv, vals, log, warn) {
    argv.slice(2)
        .map(arg => arg.split("="))
        .filter(arg => arg.length === 2 && arg[0].startsWith("--"))
        .forEach(arg => {
            let param = arg[0].slice(2), value = arg[1];
            let index = -1;
            while ((index = param.indexOf('-')) !== -1) {
                param =
                    param.substring(0, index) +
                    param[index + 1].toUpperCase() +
                    param.slice(index + 2);
            }
            if (vals[param] === undefined) return warn('Unknown param', param);
            if (Number.isInteger(vals[param])) value = Number.parseInt(value);
            log('Override default', param, ':', vals[param], '->', value);
            vals[param] = value;
        });
    return vals;
}

module.exports = misc.merge(misc, { parseArgs: parseArgs });