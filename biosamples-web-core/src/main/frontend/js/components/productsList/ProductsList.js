(function(){

	"use strict";

	module.exports = {

		template: require('./products.list.template.html'),

		components: {
			'biosample': require('../product/Product.js')
		},

        /**
         * elements to be presented into the lsit
         * @property elements
         * @type {Array}
         */
		props: ['elements','element_class']
	};
})();

