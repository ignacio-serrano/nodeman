const RequestStep = require('./RequestStep.js');
const ScriptStep = require('./ScriptStep.js');
const StepQueue = require('./StepQueue.js');
const Response = require('./Response.js');
const Colors = require('./Colors.js');

//TODO: Replace my "Colors" with the "colors" module in npm.
class TestContext {
    constructor() {
        this._res = null;
        this._response = null;
        this._env = {};
    }

    get res() {
        return this._res;
    }

    set res(value) {
        this._res = value;
        this._response = Response(value);
    }

    get response() {
        return this._response;
    }

    set response(value) {
        console.log(`${Colors.MagentaFg}Attempt to replace TestContext response ignored.${Colors.Reset}`);
    }

    get env() {
        return this._env;
    }

    set env(value) {
        console.log(`${Colors.MagentaFg}Attempt to replace TestContext environment ignored.${Colors.Reset}`);
    }

    failTest(cause) {
        if (cause) {
            throw `${Colors.RedFg}Test failed: ${cause}${Colors.Reset}`;
        } else {
            throw `${Colors.RedFg}Test failed.${Colors.Reset}`;
        }
    }
}

/* Pseudoclass TestBuilder */
function TestBuilder(testName) {
    let api = new Object();
    let _testName = testName ? testName : 'TEST';
    let _queue = StepQueue();
    var i = 0;
    let testContext = new TestContext();

    function get(url) {
        _queue.append(RequestStep('GET', url));
        return api;
    }

    function post(url) {
        _queue.append(RequestStep('POST', url));
        return api;
    }

    function head(url) {
        _queue.append(RequestStep('HEAD', url));
        return api;
    }

    function put(url) {
        _queue.append(RequestStep('PUT', url));
        return api;
    }

    function header(name, value) {
        _queue.last().addHeader(name, value);
        return api;
    }

    function body(value) {
        _queue.last().setBody(value);
        return api;
    }

    function param(name, value) {
        _queue.last().setRequestParam(name, value);
        return api;
    }

    function queryParam(name, value) {
        _queue.last().setQueryParam(name, value);
        return api;
    }

    function andPrintResponse() {
        _queue.last().setPrintResponse(true);
        return api;
    }

    function run(script) {
        _queue.append(ScriptStep(script));
        return api;
    }

    function printResponseIfNecessary() {
        if (_queue.current().getPrintResponse() && _queue.current().getPrintResponse()) {
            let res = testContext.res;
            console.log(Colors.GreenFg + '== STATUS ==');
            console.log(res.statusCode + ' (' + res.statusMessage + ')');
            console.log('== HEADERS ==');
            for (var name in res.headers) {
                console.log(`\t${name}: ${res.headers[name]}`);
            }
            console.log('== BODY ==');
            if (res.text === '') {
                console.log('(EMPTY)' + Colors.Reset);
            } else {
                console.log(res.text + Colors.Reset);
            }
        }
    }

    function handleError(err) {
        if ('Error' === err.constructor.name && err.response && err.response.res) {
            return thenOfRequest(err.response.res);
        } else {
            console.log(err);
            return err;
        }
    }

    function thenOfRequest(res) {
        let lines = res.req._header.split('\r\n');
        console.log(`${Colors.GreenFg}== ${lines[0].split(' ')[0]} ${res.req.agent.protocol}//${lines[1].split(' ')[1]}${lines[0].split(' ')[1]} ==${Colors.Reset}`);
        testContext.res = res;
        printResponseIfNecessary();

        let step = _queue.next();
        processStep(step);
        return true;
    }

    function thenOfScript(ok) {
        let step = _queue.next();
        processStep(step);
        return true;
    }

    function processStep(step) {
        if (step === null) {
            return;
        }
        switch (step.type()) {
            case 'RequestStep':
                step.doRequest(testContext.env).then(thenOfRequest).catch(handleError);
            break;
            case 'ScriptStep':
                step.doRun(testContext).then(thenOfScript).catch(handleError);
            break;
        }
    }

    function end() {
        console.log(`${Colors.GreenFg}===== ${_testName} STARTS =====${Colors.Reset}`);
        _queue.append(ScriptStep(nm => {
            console.log(`${Colors.GreenFg}===== ${_testName} ENDS =====${Colors.Reset}`);
        }))
        let step = _queue.next();

        processStep(step);
    }
    //TODO: Add conditional queues of steps.

    api.get = get;
    api.post = post;
    api.head = head;
    api.put = put;
    api.header = header;
    api.body = body;
    api.param = param;
    api.queryParam = queryParam;
    api.andPrintResponse = andPrintResponse;
    api.run = run;
    api.end = end;
    return api;
}

exports.env = function(name) {
    return '{{env:' + name + '}}';
}

exports.test = function(name) {
    return TestBuilder(name);
}