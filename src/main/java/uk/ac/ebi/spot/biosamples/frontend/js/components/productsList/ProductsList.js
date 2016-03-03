(function(){

	"use strict";

	// var _ = require('underscore');

	module.exports = {

		template: require('./products.list.template.html'),

		components: {
			'biosample': require('../product/Product.js')
		},

		props: ['elements']
	};
})();

