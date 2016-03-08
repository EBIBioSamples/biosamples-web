(function(){
	"use strict";
	/**
	 * A vue component for the shields badge as (here)[https://img.shields.io/]
	 * @class Badge
	 * @extends {VueComponent}
	 */
	module.exports = {

		/**
		 * Define the html template for the component
		 * @property template
		 * @type {Template}
		 */
		template: "<img :src='url' />",
					
		props: {
			/**
			 * The left part of the badge 
			 * @property key
			 * @type {String}
			 */
			key: '',

			/**
			 * The right part of the badge
			 * @property value
			 * @type {Object}
			 */
			value: {},

			/**
			 * The color of the badge
			 * @property color 
			 * @type {String}
			 */
			color: {},

			/**
			 * The style of the badge
			 * @property style
			 * @type {String} 
			 * @default flat
			 */
			style: {
				type: String,
				default: "flat"
			}
		},
		computed: {
			/**
			 * Return the dynamic url for the badge
			 * @property url
			 * @type {Computed Property}
			 */
			url: function() {
				var url="https://img.shields.io/badge/" + this.key + "-" + this.value + "-" + this.color + ".svg?style=" + this.style; 
				return url;
			},
		}	
	};
})();


//https://img.shields.io/badge/<SUBJECT>-<STATUS>-<COLOR>.svg