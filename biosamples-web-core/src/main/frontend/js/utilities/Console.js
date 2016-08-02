/**
 * Created by lucacherubin on 2016/08/01.
 */
module.exports = function(
    {context: consoleContext, status:status = ['info','debug','warning','error'] } = {}) {

    // Inner private variables

    const validStatus = ['info','warning','error','debug','log'];
    let enabled     = true;

    function __showStatus(s) {
        return status.indexOf(s) >= 0 || s === undefined;
    }

    function __isValidStatus(s) {
        return validStatus.indexOf(s) >= 0;
    }

    status = status.map(s => s.toLowerCase()).filter( s => __isValidStatus(s));


    var getStatus = function() {
        return [...status];
    };

    var setStatus = function(newStatus) {
        let tempStatus = newStatus.filter(s => __isValidStatus(s));
        if (tempStatus.length > 0) {
            status = [...tempStatus];
        }
    };

    var log = function({msg, type} = {}) {

        if( enabled && __showStatus(type)) {

            if (consoleContext) {
                msg.unshift(`[${consoleContext}] - `);
            }

            switch (type) {
                case "debug":
                    console.debug(...msg);
                    break;
                case "warning":
                    console.warn(...msg);
                    break;
                case "error":
                    console.error(...msg);
                    break;
                case "info":
                    console.info(...msg);
                    break;
                default:
                    console.log(...msg);
            }

        }
    };

    var debug = function(...args) {
        log({msg: args, type: "debug"});
    };

    var warning = function(...args) {
        log({msg: args, type: "warning"});
    };
    var info = function(...args) {
        log({msg: args, type: "info"});
    };

    var error = function(...args) {
        log({msg: args, type: "error"});
    };

    var group = function(name) {
        console.group(`${consoleContext ? `[${consoleContext}] - ` : ''}${name}`);
    };

    var groupCollapsed = function(name) {
        console.groupCollapsed(`${consoleContext ? `[${consoleContext}] - ` : ''}${name}`);
    };

    var groupEnd = function() {
        console.groupEnd();
    };

    var disable = function() {
        enabled = false;
    };

    var enable = function() {
        enabled = true;
    };

    return {
        log, info, debug, warning, error,
        group,groupCollapsed,groupEnd,
        enable, disable, getStatus, setStatus
    }

};

