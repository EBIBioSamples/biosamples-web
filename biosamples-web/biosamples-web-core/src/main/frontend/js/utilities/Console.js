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


    let getStatus = function() {
        return [...status];
    };

    let setStatus = function(newStatus) {
        let tempStatus = newStatus.filter(s => __isValidStatus(s));
        if (tempStatus.length > 0) {
            status = [...tempStatus];
        }
    };

    let log = function({msg, type} = {}) {

        if( enabled && __showStatus(type)) {

            if (consoleContext) {
                msg.unshift(`[${consoleContext}] - `);
            }

            switch (type) {
            case 'debug':
                console.debug(...msg);
                break;
            case 'warning':
                console.warn(...msg);
                break;
            case 'error':
                console.error(...msg);
                break;
            case 'info':
                console.info(...msg);
                break;
            default:
                console.log(...msg);
            }

        }
    };

    let debug = function(...args) {
        log({msg: args, type: 'debug'});
    };

    let warning = function(...args) {
        log({msg: args, type: 'warning'});
    };
    let info = function(...args) {
        log({msg: args, type: 'info'});
    };

    let error = function(...args) {
        log({msg: args, type: 'error'});
    };

    let group = function(name) {
        console.group(`${consoleContext ? `[${consoleContext}] - ` : ''}${name}`);
    };

    let groupCollapsed = function(name) {
        console.groupCollapsed(`${consoleContext ? `[${consoleContext}] - ` : ''}${name}`);
    };

    let groupEnd = function() {
        console.groupEnd();
    };

    let disable = function() {
        enabled = false;
    };

    let enable = function() {
        enabled = true;
    };

    return {
        log, info, debug, warning, error,
        group,groupCollapsed,groupEnd,
        enable, disable, getStatus, setStatus
    };

};

