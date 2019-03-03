/* Pseudoclass ScriptStep */
module.exports = function(script) {
    let api = new Object();
    let _script = script;

    async function doRun(testContext) {
        _script(testContext);
    }

    function type() {
        return 'ScriptStep';
    }

    api.doRun = doRun;
    api.type = type;
    return api;
}