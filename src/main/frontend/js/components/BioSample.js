(function(){
	"use strict";

	var _ = require('underscore');

	module.exports = function(solrDocument) {

		var unwantedProperties = ['_version_','format_version'];
		var summaryFields      = ['accession','name','description','update_date','content_type'];
		var summaryLabels      = ['organism_crt','organ_crt'];
		// var labels = {
		// 	all: [],
		// 	baseSummary: ['accession','name','description','update_date','content_type'],
		// 	additionalSummary: ['organism_crt','organ_crt']
		// };
		
		var completeObj,filteredObj;

		// Filter properties from an object
		function removeUnwantedProperties(obj,propToRemove) {
			var tempObj = {};

			for(var propertyName in obj) {
				if (obj.hasOwnProperty(propertyName) && propToRemove.indexOf(propertyName) === -1)  {
					tempObj[propertyName] = obj[propertyName];
				}
			}	

			return tempObj;
		}


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
