/* Pseudoclass Response */
module.exports = function(res) {
    let api = new Object();
    let cookieMap = {};

    (function() {
        let cookieHeaders = res.headers['set-cookie'];
        if (cookieHeaders) {
            var cookies = [];
            for (var i = 0; i < cookieHeaders.length; i++) {
                let tmp = cookieHeaders[i].split(';');
                for (var j = 0; j < tmp.length; j++) {
                    cookies.push(tmp[j].trim());
                }
            }
            for (var i = 0; i < cookies.length; i++) {
                let element = cookies[i];
                let eq = element.indexOf('=');
                let name = element.substr(0, eq);
                let value = element.substring(eq + 1, element.length);
                cookieMap[name] = value;
            }
        }
    })();

    let cookies = {};
    cookies.get = function(name) {
        let ret = cookieMap[name];
        if (ret) {
            return ret;
        } else {
            null;
        }
    }

    api.cookies = cookies;
    return api;
}