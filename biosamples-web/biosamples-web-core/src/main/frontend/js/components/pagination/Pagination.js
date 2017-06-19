/**
 * Component to handle the page change
 * @class Pagination
 * @extends {VueComponents}
 * @require underscore
 */
(function(){
    'use strict';

    let stretchy = require('../stretchy/stretchy.js');

    module.exports = {
        template: require('./alternative.pagination.template.html'),

        props: {
            /**
             * The total number of results
             * @property totalResults
             * @type {Number}
             */
            totalResults: {
                type: Number
            },

            /**
             * The number of items per page
             * @property displayedResults
             * @type {Number}
             */
            displayedResults:{
                type: Number
            }
        },

        data: function() {
            return {
                /**
                 * The actual page
                 * @property currentPage
                 * @type {Number}
                 */
                currentPage: 1,

                inputPage: 1,

                /**
                 * True if we are in editing mode and user can type the current page
                 * @property editMode
                 * @type {Boolean}
                 */
                editMode: false
            };
        },

        computed: {
            /**
             * Count the total number of available pages five as totalResults/displayedResults
             * @property totalPages
             * @type {Function}
             */
            totalPages: function() {
                this.currentPage = 1;
                return Math.ceil(this.totalResults/this.displayedResults);
            },




        },

        ready: function() {
            console.log(this._getStatus());
            stretchy.Stretchy.init();
        },

        methods: {
            /**
             * Dispatchs the custom event `page-changed` and create the
             * pagination given the currentPage
             * @deprecated
             * @method createPaginationWith
             */
            createPaginationWith: function(currentPage) {
                this.inputPage = currentPage;
                this.$dispatch('page-changed',currentPage);

                /*
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
				 */
            },

            /**
             * Move to the next {displayedResults} results
             * @method goNext
             */
            goNext: function() {
                if(!this.isLastPage(this.currentPage)) {
                    this.currentPage++;
                    console.log('Moving to ' + this.currentPage);
                    this.createPaginationWith(this.currentPage);
                }
            },

            /**
             * Move to the previous {displayedResults} results
             * @method goPrevious
             */
            goPrevious: function() {
                if (!this.isFirstPage(this.currentPage)){
                    this.currentPage--;
                    console.log('Moving to ' + this.currentPage);
                    this.createPaginationWith(this.currentPage);
                }
            },

            /**
             * Jump to the `page` containing {displayedResults} results
             * @method jumpTo
             * @param page {Number} the page to jump to
             */
            jumpTo: function(page) {
                if (page <= this.totalPages) {
                    this.currentPage = page > 0 ? page : 1;
                    console.log('Jumping to ' + this.currentPage);
                } else if (page >= this.totalPages){
                    this.currentPage = this.totalPages;
                }
                this.createPaginationWith(this.currentPage);
            },

            /**
             * Set editmode to `true`
             * @method enterEditMode
             */
            enterEditMode: function() {
                this.editMode = true;
                this.inputPage = this.currentPage;

            },

            /**
             * Set editmode to `false`
             * @method exitEditMode
             */
            exitEditMode: function() {
                this.editMode = false;
                this.jumpTo(parseInt(this.inputPage));
            },

            /**
             * Return `true` if passed element is '...'
             * @method isDots
             * @param elem {Object} the element to check
             * @return {Boolean}
             */
            isDots: function(elem) {
                return elem === '...';
            },

            /**
             * Return `true` if the passed element correspond to the {currentPage}
             * @method isCurrentPage
             * @param elem {Object} the element to check
             * @return {Boolean}
             */
            isCurrentPage: function(elem) {
                return elem == this.currentPage;
            },

            /**
             * @method isLastPage
             * @param page {Object} the element to check
             * @return {Boolean} is `true` if the passed element is the last page
             *
             */
            isLastPage: function(page) {
                return page >= this.totalPages;
            },

            /**
             * @method isFirstPage
             * @param page {Object} the element to check
             * @return {Boolean} is `true` if the passed element correspond to the first page
             */
            isFirstPage: function(page) {
                return page <= 1;
            },


            /**
             * @method needNavigation
             * @return {Boolean} Always return `true`
             */
            needNavigation: function() {
                return true;
            },

            /**
             * @method needPagination
             * @return {Boolean} `true` if the number of total pages is greater than 1
             */
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

