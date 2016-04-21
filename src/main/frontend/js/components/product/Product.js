/**
 * @class Product
 * @extend {VueComponents}
 */

(function(){
    "use strict";

    var _ = require('lodash');

    /**
     * Remove the `_crt` suffix from the characteristics
     * @method removeCrtExtension
     * @private
     * @param obj {Object} the key-value pairs of fields
     */
    function removeCrtExtension(obj) {
        var finObj = _.create({});
        var keys = _.keys(obj);
        var vals = _.values(obj);
        for (var i=0; i< keys.length; i++) {
            keys[i] = keys[i].replace('_crt','');
            finObj[keys[i]] = vals[i];
        }

        return finObj;
    }

    module.exports = {
        template: require('./product.template.html'),

        props: {
            /**
             * The accession/id of the product
             * @property accession 
             * @type {String}
             */
            accession: {
                type: String,
                required: true
            },

            /**
             * The product title
             * @property title
             * @type {String}
             * @default ''
             */
            title: {
                default: ''
            },

            /**
             * The product description
             * @property description
             * @type {String}
             * @default 'No description provided'
             */
            description: {
                type: String,
                default: 'No description provided'
            },
            /**
             * The product type, `Sample` or `Group`
             * @property type
             * @type {String}
             * @default 'Sample'
             */
            type: {
                type: String,
                default: 'sample'
            },
            /**
             * The product date
             * @property date
             * @type {String}
             * @default ''
             */
            date: {
                type: String,
                default: ''
            },

            /**
             * Labels associated with the product
             * @property labels
             * @type {Object}
             * @default {}
             */
            labels: {
                type: Object,
                default: function() {
                    return {};
                }
            }

        },

        computed: {
            /**
             * The sample single page url
             * @property itemPage
             * @type {Function}
             * @return {String}
             */
            itemPage: function() {
                switch(this.type.toLowerCase()) {
                    case 'sample':
                        return 'sample/' + this.accession;
                    case 'group':
                        return 'group/' + this.accession;
                }
            },

            /**
             * @property simpleLabels
             * @type {Function}
             * @return object {Object} containing the product labels without `_crt` suffix
             */
            simpleLabels: function() {
                // var finObj = _.create({});
                // var keys = _.keys(this.labels);
                // var vals = _.values(this.labels);
                // for (var i=0; i< keys.length; i++) {
                // 	keys[i] = keys[i].replace('_crt','');
                // 	finObj[keys[i]] = vals[i];
                // }

                // return finObj;
                return removeCrtExtension(this.labels);

            },

            /**
             * @property labelColors
             * @type {Function}
             * @return {Array} available colors to use with labels
             */
            labelColors: function() {
                return ['orange','blue'];
            }


        },

        methods: {
            /**
             * Provide a way to cycle through valid colors
             * @method labelColor
             * @param n {Number}
             * @return {String} a valid color string
             */
            labelColors: function(n) {
                console.log(this.accession);
                console.log(n);
                var validColors = ['brightgreen','yellow','orange','azure'];
                return validColors[+n % validColors.length];
            },


        }


    };
})();
