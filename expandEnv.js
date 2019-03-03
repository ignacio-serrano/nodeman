const common = require('./common.js');

module.exports = function(env, str) {
    if (common.isString(str)) {
        var ret = str;
        var matches = str.match(/{{.+?}}/g);
        if (matches) {
            if (matches.length === 1 && matches[0].startsWith('{{env:')) {
                let name = matches[0].substring(6, matches[0].length - 2);
                if (env[name]) {
                    return env[name];
                } else {
                    return null;
                }
            }

            for (var i = 0; i < matches.length; i++) {
                let match = matches[i];
                let name = match.substring(2, match.length - 2);
                if (env[name]) {
                    ret = ret.replace(match, env[name]);
                }
            }
        }
        return ret;
    } else {
        return str;
    }
}