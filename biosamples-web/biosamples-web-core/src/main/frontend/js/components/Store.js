'use strict';

let _ = require('lodash');

module.exports = (function() {

    let instance;
    let defaultVars = {
        baseUrl: '/biosamples'
    };

    function init(customVars) {
        return _.assignIn(defaultVars,customVars);
    }

    return {

        getInstance: function (customVariables = {}) {
            if (!instance) {
                instance = init(customVariables);
            }
            return instance;
        }
    };
})();
