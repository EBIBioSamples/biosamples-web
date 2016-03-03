(function(){
	"use strict";

	var _ = require('underscore');

	function removeCrtExtension(obj) {
		var finObj = _.create({});
		var keys = _.keys(obj);
		var vals = _.values(obj);
		for (var i=0; i< keys.length; i++) {
			keys[i] = keys[i].replace('_crt','');
			finObj[keys[i]] = vals[i];
		}

		return finObj;
	}

	module.exports = {
		template: require('./product.template.html'),

		props: {
			accession: {
				type: String,
				required: true
			},
			title: {
				default: ''
			},
			description: {
				type: String,
				default: 'No description provided'
			},
			type: {
				type: String,
				default: 'Sample'
			},
			date: {
				type: String,
				default: ''
			},
			labels: {
				type: Object,
				default: function() {
					return {};
				}
			}
			
		},

		computed: {
			itemPage: function() {
				return '/sample/' + this.accession;
			},

			simpleLabels: function() {
				// var finObj = _.create({});
				// var keys = _.keys(this.labels);
				// var vals = _.values(this.labels);
				// for (var i=0; i< keys.length; i++) {
				// 	keys[i] = keys[i].replace('_crt','');
				// 	finObj[keys[i]] = vals[i];
				// }

				// return finObj;
				return removeCrtExtension(this.labels);

			},

			labelColors: function() {
				return ['orange','blue'];
			}

			
		},

		methods: {
			labelColors: function(n) {
				console.log(this.accession);
				console.log(n);
				var validColors = ['brightgreen','yellow','orange','azure'];
				return validColors[+n % validColors.length];
			},


		}


	};
})();
