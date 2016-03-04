var _ = require('underscore');

module.exports = {

	template: require('./products.table.template.html'),

	props: ['elements','columns', 'filterTerm'],

	data: function() {
		return {
			sortKey: '',
			reverseSort: false
		};
	},

	computed: {
		_columns: function() {
			return _.map(this.columns,function(element){
				return element.toLowerCase();
			});
		}
	},

	methods: {
		sortBy: function(name) {
			this.reverseSort = (name == this.sortKey) ? ! this.reverseSort : false;
			this.sortKey = name;
		},
	}

};