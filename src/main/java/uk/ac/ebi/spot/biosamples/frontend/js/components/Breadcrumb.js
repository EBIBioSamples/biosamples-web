(function(){
	"use strict";

	var _        = require('lodash');
	var validate = require("validate.js");
	
	var pages    = {};

	var constraints = {
		pageName: {
			presence: true,
			length: {
				minimum: 3
			}
		},
		pageUrl: {
			presence: true,
			url: {
				allowLocal: true
			}

		}
	};

	/**
	* Add a page object to the breadcrumb
	* Each page has a name and a url and are pushed one
	* after the other
	*
	* @param  {String} name
	* @param  {String} url
	*/

	var addPage = function(name,url) {
		var pageObj = {
			pageName: name, 
			pageUrl: url
		};

		var validEntry = validate(pageObj, constraints);

		if (typeof validEntry === 'undefined') {
			this.pages.push(pageObj);
		}
	};

	/**
	 * Remove a page from the list of pages, looking both for the page name
	 * or the page URL
	 *
	 * @param {String} value
	 */
	var removePage = function(value) {
		for (var i = 0, n = this.pages.length; i < n; i++) {
			if(this.pages[i].pageName === value || this.pages[i].pageUrl === value) {
				this.pages.slice(i,1);
			}
		}
	};

	
	return {
		addPage: addPage,
		removePage: removePage,
		getPages: function() {
			return this.pages;
		}
	};
})();