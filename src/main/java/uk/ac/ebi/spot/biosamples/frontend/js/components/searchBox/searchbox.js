module.exports = {
	template: require('./searchbox.template.html'),

	data: function() {
		return {
			searchTerm: 'Hello there'
		};
	},

	methods: {
		getTerm: function() {
			return this.searchTerm;
		}
	}
};