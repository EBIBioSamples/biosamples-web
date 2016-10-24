/**
 *
 * @class Date Format Filter
 * @extends {Vue filter}
 */
(function(){
    "use strict";

    /**
     * @method dateFormat
     * @param  {String} date_string   The date string you want to format
     * @return {String}           The date formatted
     */
    let _ = require("lodash");
    let solrDateFormat = /(\d{4}-\d{2}-\d{2})T((\d{2}:\d{2}:\d{2}).\d{2,3})Z/;

    module.exports = function(date_string) {
        if (typeof date_string !== "undefined" && date_string !== null) {

            var parts = solrDateFormat.exec(date_string);
            if (parts !== null) {
               date_string =  parts[1];
            }

        }
        return date_string;
    };
})();