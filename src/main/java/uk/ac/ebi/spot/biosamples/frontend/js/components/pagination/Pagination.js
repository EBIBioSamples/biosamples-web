(function(){
	"use strict";

	var _ =  require('underscore');

	module.exports = {
		template: require('./alternative.pagination.template.html'),

		props: ['totalResults', 'displayedResults'],

		data: function() {
			return {
				currentPage: 1,
				editMode: false
			};
		},

		computed: {
			totalPages: function() {
				this.currentPage = 1;
				return Math.ceil(this.totalResults/this.displayedResults);
			}

		},

		ready: function() {
			console.log(this._getStatus());
		},

		methods: {
			createPaginationWith: function(currentPage) {
				this.$dispatch('page-changed',currentPage);	
				var finalPaginationArray = [];
				var totalPages = this.totalPages;
				if (totalPages < 5) {
					return _.range(1,totalPages+1);
				} else {

					if (currentPage < 5) {
						return _.range(1,6)
								.concat(['...',totalPages]);
					} else if (currentPage <= totalPages - 4) {
						return [1,'...',].concat(
								_.range(currentPage-2,currentPage+3),
								['...',totalPages]);
					} else {
						return [1,'...'].concat(
								_.range(totalPages-4,totalPages+1));
					}

				}
			},

			goNext: function() {
				if(!this.isLastPage(this.currentPage)) {
					this.currentPage++;
					console.log('Moving to ' + this.currentPage);
					this.createPaginationWith(this.currentPage);					
				}
			},

			goPrevious: function() {
				if (!this.isFirstPage(this.currentPage)){
					this.currentPage--;
					console.log('Moving to ' + this.currentPage);
					this.createPaginationWith(this.currentPage);					
				}
			},

			jumpTo: function(page) {
				if (page <= this.totalPages) {
					this.currentPage = page;
					console.log('Jumping to ' + this.currentPage);
				} else {
					this.currentPage = this.totalPages;
				}
				this.createPaginationWith(this.currentPage);	
			},

			enterEditMode: function() {
				this.editMode = true;

			},

			exitEditMode: function() {
				this.editMode = false;
				this.jumpTo(this.currentPage);
			},

			isDots: function(elem) {
				return elem == '...';
			},

			isCurrentPage: function(elem) {
				return elem == this.currentPage;
			},

			isLastPage: function(page) {
				return page >= this.totalPages;
			},

			isFirstPage: function(page) {
				return page <= 1;
			},

			needNavigation: function() {
				return true;
			},

			needPagination: function(){
				console.log('Here');
				return this.totalPages > 1;
			},

			_getStatus: function() {
				return 'Pagination:\n[page]:' + this.currentPage + '\n[total results]: ' + this.totalResults +
					    '\n[results x page]: ' + this.displayedResults + '\n[total pages]: ' + this.totalPages + ';';
			}


		}



	};	
})();

