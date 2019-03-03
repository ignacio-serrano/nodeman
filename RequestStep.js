const superagent = require('superagent');
const querystring = require('querystring');
const common = require('./common.js');
const expandEnv = require('./expandEnv.js');

/* Pseudoclass RequestStep */
module.exports = function(method, url) {
    let api = new Object();
    let _method = method;
    let _url = url;
    let headers = {};
    let requestParams = {};
    let queryParams = {};
    var body = null;
    var hasToPrintResponse = false;

    let methodMap = {
        'HEAD': url => superagent.head(url),
        'PUT': url => superagent.put(url),
        'GET': url => superagent.get(url),
        'POST': url => superagent.post(url)
    }

    async function doRequest(env) {
//        if (_url === 'http://localhost:8080/v1/cards') console.debug('doRequest(): _method: "%s", _url: "%s"', _method, _url);
//        if (_url === 'http://localhost:8080/v1/cards') console.debug('doRequest(): env: %o', env);
        var p = methodMap[_method](expandEnv(env, _url));

        for (var name in queryParams) {
            let v = queryParams[name];
            queryParams[name] = undefined;
            queryParams[expandEnv(env, name)] = expandEnv(env, v);
        }

        /* "for" is used here to identify whether there are query params or not. */
        for (var name in queryParams) {
            p.query(queryParams);
            break;
        }

        if (body) {
            if (common.isString(body)) {
                p.send(expandEnv(env, body));
            } else { //Here I am presuming that body is an object, which may not be the case.
                //if (_url === 'http://localhost:8080/v1/cards') console.debug('doRequest(): body: %o', body);
                //TODO: This should be done iteratively.
                for (var name in body) {
                    //if (_url === 'http://localhost:8080/v1/cards') console.debug('doRequest(): name: "%s"', name);
                    let v = body[name];
                    //if (_url === 'http://localhost:8080/v1/cards') console.debug('doRequest(): v: ' + v);
                    body[name] = undefined;
                    body[expandEnv(env, name)] = expandEnv(env, v);
                    //if (_url === 'http://localhost:8080/v1/cards') console.debug('doRequest(): body[%s]: ' + v, body[expandEnv(env, name)]);
                }
                p.send(body);
            }
        }

        for (var name in requestParams) {
            let v = requestParams[name];
            requestParams[name] = undefined;
            requestParams[expandEnv(env, name)] = expandEnv(env, v);
        }

        /* "for" is used here to identify whether there are request params or not. */
        for (var r in requestParams) {
            p.send(querystring.stringify(requestParams));
            break;
        }

        for (var h in headers) {
            //TODO: Does this need explicit comma separation?
            for (var i = 0; i < headers[h].length; i++) {
                p.set(expandEnv(env, h), expandEnv(env, headers[h][i]));
            }
        }
        return await p;
    }

    function type() {
        return 'RequestStep';
    }

    function addHeader(name, value) {
        if (!headers[name]) {
            headers[name] = [];
        }
        headers[name].push(value);
    }

    function setRequestParam(name, value) {
        requestParams[name] = value;
    }

    function setQueryParam(name, value) {
        queryParams[name] = value;
    }

    function setBody(value) {
        body = value;
    }

    function setPrintResponse(value) {
        hasToPrintResponse = value;
    }

    function getPrintResponse() {
        return hasToPrintResponse;
    }

    api.doRequest = doRequest;
    api.type = type;
    api.addHeader = addHeader;
    api.setBody = setBody;
    api.setRequestParam = setRequestParam;
    api.setQueryParam = setQueryParam;
    api.setPrintResponse = setPrintResponse;
    api.getPrintResponse = getPrintResponse;
    return api;
}