(function(){
	"use strict";

	var _ = require('lodash');

	module.exports = {
		template: require('./ebibreadcrumb.template.html'),
		prop: {
			// pageList: {
			// 	required: true,
			// 	type: Object,
			// 	validator: function(value) {
			// 		return value instanceof Breadcrumb;
			// 	}
			// }
		}
	};
})();