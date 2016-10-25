/**
 *
 * @class Excerpt Filter
 * @extends {Vue filter}
 */
(function(){
    "use strict";

    /**
     * @method excerpt
     * @param  {String} value     the value you want to excerpt
     * @param  {Number} maxLength the maximum number of characters
     * @return {String}           The excerped String
     */
    module.exports = function(value,format) {
        if (typeof value !== "undefined" && value !== null) {

            if (!format) {
                format = "en-UK"
            }
            return new Intl.NumberFormat(format,{
                style: "decimal"
            }).format(value);

        }
        return value;
    };
})();