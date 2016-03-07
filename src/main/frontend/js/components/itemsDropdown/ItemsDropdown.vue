<template>
<div class="dropdown">
    <button class="btn btn-default dropdown-toggle" type="button" id="itemsPerPageMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{textFiller}} {{itemsPerPage}}
    <span class="caret"></span></button>
    <ul class="dropdown-menu" aria-labelledby="itemsPerPageMenu">
        <li v-for="choice in choices">
            <a href="#" v-on:click.prevent="updateItemsPerPage(choice)">{{choice}}</a>
        </li>                         
    </ul>
</div> 
</template>


<script>
var _ = require('underscore');

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
			default: "Items per page: "
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

</script>
