module.exports = {
	// template: '<img v-attr="src=https://img.shields.io/badge/{{key}}-{{value}}-{{color}}.svg" v-attr="alt="{{key}}-{{value}}">',
	template: "<img :src='url' />",
				
	props: {
		key: {},
		value: {},
		color: {},
		style: {
			type: String,
			default: "flat",
			validator: function(value) {
				
			}
		}
	},
	computed: {
		url: function() {
			var url = "https://img.shields.io/badge/" + this.key + "-" + this.value + "-" + this.color + ".svg?style=" + this.style; 
			return url;
		},
	}
};

//https://img.shields.io/badge/<SUBJECT>-<STATUS>-<COLOR>.svg