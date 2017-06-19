/**
 *
 * @class Number Format Filter
 * @extends {Vue filter}
 */
(function(){
    'use strict';

    /**
     * @method numberFormat
     * @param  {Number} value     the value you want to format as a number
     * @param  {String} format the custom format you want to use
     * @return {Number}           The formatted Number
     */
    module.exports = function(value,format) {
        if (typeof value !== 'undefined' && value !== null) {

            if (!format) {
                format = 'en-UK';
            }
            return new Intl.NumberFormat(format,{
                style: 'decimal'
            }).format(value);

        }
        return value;
    };
})();