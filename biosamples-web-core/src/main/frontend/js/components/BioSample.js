(function(){
	"use strict";

	var _ = require('lodash');

	module.exports = function(solrDocument,
							  summaryFields = ['accession','name','description','updatedate','content_type'],
							  summaryLabels = ['organism_crt','organ_crt']) {

        /**
         * List of keys in the solrDocument we don't want to present
         * @property unwantedProperties
         * @type {Array}
         */
		var unwantedProperties = ['_version_','format_version'];

        /**
         * List of keys in the SolR Document we want to use to summarize the document
         * @param summaryFields
         */

		// var summaryFields      = ['accession','name','description','updatedate','content_type'];
		// var summaryLabels      = ['organism_crt','organ_crt'];

		
		var completeObj,filteredObj;

        /**
         * Filter properties form an object
         * @method removeUnwantedProperties
         * @param obj {Object} the object to filter
         * @param propToRemove {Array} list of properties to remove from the object
         * @return {Object} a new object with just the filtered fields
         */
		function removeUnwantedProperties(obj,propToRemove) {
			var tempObj = {};

			for(var propertyName in obj) {
				if (obj.hasOwnProperty(propertyName) && propToRemove.indexOf(propertyName) === -1)  {
					tempObj[propertyName] = obj[propertyName];
				}
			}	

			return tempObj;
		}


        /**
         * Return an object with just the specific properties
         * @method getWantedProperties
         * @param obj {Object} the object to process
         * @param propToMaintain {Array} the properties to maintain 
         * @return {Object} 
         */
		function getWantedProperties(obj,propToMaintain) {
			var tempObj = {};

			for(var propertyName in obj) {
				if (obj.hasOwnProperty(propertyName) && propToMaintain.indexOf(propertyName) > -1)  {
					tempObj[propertyName] = obj[propertyName];
				}
			}

			return tempObj;

		}

		completeObj = solrDocument;
		filteredObj = removeUnwantedProperties(solrDocument,unwantedProperties);

		return {
			// doc: {
			// 	original: completeObj,
			// 	filtered: filteredObj
			// },
			// labels: labels
			original: completeObj,
			filtered: filteredObj,
			summaryObj: getWantedProperties(filteredObj,summaryFields),
			summaryLabelObj: getWantedProperties(filteredObj,summaryLabels)
		};
	
	};
})();
