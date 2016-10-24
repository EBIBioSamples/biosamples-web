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

	module.exports = function(strings) {
		if ( _.isArray(strings) ) {
			let startCaseString = [];
			_.forEach(strings, function(value) {
				startCaseString.push(_.chain(value).lowerCase().capitalize().value());
			});
			return startCaseString;
		} else {
			return _.chain(strings).lowerCase().capitalize().value();
		}
	};
})();