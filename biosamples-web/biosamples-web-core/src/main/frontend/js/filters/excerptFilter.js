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
	module.exports = function(value,maxLength) {
		if (typeof value !== "undefined" && value !== null) {
			
			if (typeof maxLength === "undefined" || maxLength === null) {
				maxLength = 300;
			}

			if (typeof value === "string") {
				if (value.length > maxLength) {
					return value.slice(0,maxLength) + "...";
			 	}		
			}
			
		}
		return value;
	};
})();