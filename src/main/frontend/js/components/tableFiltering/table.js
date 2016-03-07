var _ = require('underscore');

module.exports = {
	template: require('./table.template.html'),

	created: function() {
		this.$on('pageItems-chosen',function(itemsPerPage) {
			console.log('Items changed: ' + itemsPerPage);
			this.displayedResults = itemsPerPage;
		});
	},

	props: ['totalResults','displayedResults','filterTerm'],

	components: {
		'pagination': require('../components/pagination/Pagination.js'),
		'items-dropdown': require('../components/itemsDropdown/ItemsDropdown.js')
	},

	data: function() {
		return {
			availableItemsPerPage: [10,25,50,100,250,500,1000]
		};
	},

	methods: {
		// queryAll: function(pagination){
		// 	this.$http.get("http://localhost:8080/home",pagination)
		// 	.success(function(data){
		// 		this.totalResults = data.response.numFound;
		// 		pageNumber = data.response.start + 1;
		// 		this.countPages(this.totalResults);
		// 		this.$set("database",data.response.docs);
		// 	})
		// 	.error(function(data,status,response){
		// 		console.log(status + " " + response);
		// 	});

		// },

		// querySuccess: function(data) {

		// },

		// queryError: function(data,status,response) {

		// },

		hasResults: function() {
			return this.resultsNumber > 0;
		}
	}

};