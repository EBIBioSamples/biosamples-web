(function(){
	"use strict";

	module.exports = {
		template: require('./product.template.html'),

		props: {
			accession: {
				type: String,
				required: true
			},
			title: {
				type: String,
				default: 'Untitled'
			},
			description: {
				type: String,
				default: 'No description provided'
			},
			type: {
				type: String,
				default: 'Sample'
			},
			releaseDate: {
				type: String
			}
		},

		computed: {
			itemPage: function() {
				return '/sample/' + this.title;
			}
		}
	};
})();