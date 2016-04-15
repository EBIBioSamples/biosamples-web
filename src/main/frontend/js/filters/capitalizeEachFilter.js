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
		let capitalStrings = []; 
		_.forEach(strings, function(value) {
			capitalStrings.push(_.chain(value).lowerCase().capitalized().value());
		});
		return capitalStrings;
	};
})();