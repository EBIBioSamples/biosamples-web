let _ = require('lodash');

module.exports = {
    template: require('./dropdown.template.html'),

    props: {
        choices: {
            type:Array,
            default: function() {
                return [10,25,50,100,250,500,1000];
            }
        },
        textFiller: {
            type:String,
            default: 'Items per page: '
        },
        itemsPerPage: {
            type:Number,
            default: 10
        }
    },

    ready: function() {
        this.updateItemsPerPage(this.choices[0]);
    },

    methods: {
        updateItemsPerPage: function(newValue) {
            if (_.indexOf(this.choices, newValue) >= 0) {
                console.log(newValue);
                this.itemsPerPage = newValue;
                this.$dispatch('dd-item-chosen',this.itemsPerPage);
            }
        }
    }

};
