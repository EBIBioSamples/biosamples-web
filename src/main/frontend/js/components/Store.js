/**
 * Created by lucacherubin on 2016/04/25.
 */

"use strict";

let _ = require("lodash");

module.exports = (function() {

    var instance;
    var defaultVars = {
        baseUrl: '/biosamples'
    };

    function init(customVars) {
        return _.assignIn(defaultVars,customVars)
    }

    return {

        getInstance: function (customVariables = {}) {
            if (!instance) {
                instance = init(customVariables)
            }
            return instance;
        }
    };
})();
