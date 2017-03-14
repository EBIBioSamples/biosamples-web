/**
 *  
 * @class Capitalize Filter
 * @extends {Vue filter}
 */
(function(){
	"use strict";

	/**
	 * @method excerpt
	 * @param  {String} strings   the string or strings you want to capitalize
	 * @return {String}           The capitalized String
	 */
	let _ = require("lodash");
    const regex = /([Ee]xternal)([ _-])(?:([Rr]eference)s)([ _-])([Nn]ame)/g;
    const subst = `$1$2$3`;
	function filter(string) {
	    return string.replace(regex, subst);
	}

	module.exports = function(strings) {
		if ( _.isArray(strings) ) {
		    return strings.map(filter);
		} else {
			return filter(strings);
		}
	};
})();