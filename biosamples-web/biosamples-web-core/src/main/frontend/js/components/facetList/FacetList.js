/**
 * Container for facet list
 * @class FacetList
 * @extends {VueComponent}
 */
(function(){
    'use strict';

    module.exports = {
        template: require('./facetlist.template.html'),

        props: {
            /**
             * The title of the facet section
             * @property title
             * @type {String}
             */
            title: {
                type: String,
                required: true
            },
            /**
             * The list of availables facet keys
             * @property keys
             * @type {Array}
             */
            keys: [],

            /**
             * The list of values associated with the facet keys
             * @property values
             * @type {Array}
             */
            values: {},

            /**
             * An ID that identify the facet component
             * @property facetID
             * @type {String}
             * @default ''
             *
             */
            facetId: ''

        },

        data: function() {
            /**
             * Contains the selected facet key
             * @property selected
             * @type {String}
             */
            return  {
                selected: '',
                collapsed: false
            };

        },

        methods: {
            /**
             * Return true if there's at least one facet
             * @method hasFacets
             * @return {Boolean}
             */
            hasFacets: function(){
                return typeof this.keys !== 'undefined' && this.keys.length > 0;
            },

            /**
             * Set/toggle the selected facet and emit the a custom event
             * @method facetSelected
             * @param key {String} the facet key selected by user
             * @event facet-selected
             */
            facetSelected: function(key) {
                this.selected != key ? this.selected = key : this.selected = '';
                this.$dispatch('facet-selected',this.facetId,this.selected);
            },

            /**
             * Return true if the facet is currently selected
             * @method
             * @param {String} facet
             * @return {Boolean}
             */
            isSelected: function(facet) {
                return this.selected === facet;
            },

            facetName: function(facet) {
                return facet === 'External references name' ?
                    'External reference' :
                    facet;
            }

        },

        events: {
            'collapse': function (collapse) {
                this.collapsed = collapse;
            }
        }
    };
})();
