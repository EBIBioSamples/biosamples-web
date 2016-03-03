(function(){
	"use strict";

	module.exports = {
		template: require('./facetlist.template.html'),

		props: {
			title: {
				type: String,
				required: true
			},
			keys: {},
			values: {},
			facetId: ''

		},

		data: function() {
			return  {
				selected: ''
			}

		},

		methods: {
			hasFacets: function(){
				return typeof this.keys !== 'undefined' && this.keys.length > 0;
			},

			facetSelected: function(key) {
				this.selected != key ? this.selected = key : this.selected = '';
                this.$dispatch('facet-selected',this.facetId,this.selected);
			},

			isSelected: function(facet) {
				return this.selected === facet;	
			}
		}
	};
})();
