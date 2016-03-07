(function(){
	"use strict";

	 module.exports = function(value,maxLength) {
		if (typeof value !== "undefined" && value !== null) {
			if (typeof maxLength === "undefined" || maxLength === null) {
				maxLength = 300;
			}
			if (value.length > maxLength) {
				return value.slice(0,maxLength) + "...";
		 	}	
		}
		return value;
	};
})();