(function(){
	"use strict";
	var _ = require('lodash');

	module.exports = 
	{
		template: require('./navigation.template.html'),

		data: function() {
			return {
				pages: {
					'Home' : '/',
					'Samples': '/samples/',
					'Sample Groups': '/groups/',
					'Submit': '/submit/',
					'Help': '/help/',
					'About BioSamples': '/about/'
				}
			};
		},
		
		props: {
			currentPage: {
				type: String,
				required: true,
			}
		},
	
		methods: {
			isActive: function(value) {
				if (typeof value === 'string') {
					return this.pages[value] === this.$route.path;
				}
			},

			// setActivePage: function(key) {
			// 	if (_.indexOf(_.keys(this.pages),key) > -1) {
			// 		this.currentPage = key;
			// 	}
			// }
		}
	};

})();