/**
 *
 * @class Capitalize Filter
 * @extends {Vue filter}
 */
(function(){
    'use strict';

    /**
    * @method excerpt
    * @param  {String} strings   the string or strings you want to capitalize
    * @return {String}           The capitalized String
    */
    let _ = require('lodash');
    function filter(value) {
        return _.chain(value).lowerCase().capitalize().value();
    }

    module.exports = function(strings) {
        if ( _.isArray(strings) ) {
            return strings.map(filter);
        } else {
            return filter(strings);
        }
    };
})();