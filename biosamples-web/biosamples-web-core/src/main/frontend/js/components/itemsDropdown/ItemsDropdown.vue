/**
* Component to create a pages drop-down menu
* @class ItemsDropdown
* @extends {VueComponent}
*/

/**
* html template for the component
* @property vuetemplate
* @type {Template}
*/

<template>
    <div class="dropdown" data-component="dropdown">
        <button class="btn btn-default dropdown-toggle" type="button" id="itemsPerPageMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{textFiller}} {{itemsPerPage}}
            <span class="caret"></span></button>
        <ul class="dropdown-menu" aria-labelledby="itemsPerPageMenu">
            <li v-for="choice in choices">
                <a href="#" @click.prevent="updateItemsPerPage(choice)">{{choice}}</a>
            </li>
        </ul>
    </div>
</template>


<script>

    let _ = require('underscore');

    module.exports = {
        props: {
            /**
             * The available items in the dropdown
             * @proerty choices
             * @type {Array}
             * @default [10,25,50,100,250,500,1000]
             */
            choices: {
                type:Array,
                default: function() {
                    return [10,25,50,100,250,500,1000];
                }
            },

            /**
             * The text to prepend to the selected value
             * @property textFiller
             * @type {String}
             * @default "Items per page: "
             */
            textFiller: {
                type:String,
                default: 'Items per page: '
            },
            /**
             * The selected number of items per page
             * @property itemsPerPage
             * @type {Number}
             * @default 10
             */
            itemsPerPage: {
                type: Number,
                default: 10
            }
        },

        /**
         * When the component is ready, call `updateItemsPerPage` using the first value
         * @method ready
         */
        ready: function() {
        },

        methods: {
            /**
             * Fire a `dd-item-chosen` custom event with the number new value selected from the dropdown
             * @method updateItemsPerPage
             * @param {Object} newValue
             */
            updateItemsPerPage: function(newValue) {
                if (_.indexOf(this.choices, newValue) >= 0) {
                    console.log(newValue);
                    this.itemsPerPage = newValue;
                    this.$dispatch('dd-item-chosen',this.itemsPerPage);
                }
            }
        }

    };

</script>
