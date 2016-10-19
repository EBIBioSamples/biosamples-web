(function(window){
    "use strict";

    // Init
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Vue starting configuration
    var Vue = require("vue");
    Vue.use(require("vue-resource"));
    Vue.config.debug = false;
    Vue.config.silent = true;


    // Filters
    Vue.filter('excerpt',require('./filters/excerptFilter.js'));
    Vue.filter('startCase', require('./filters/startCaseFilter.js'));
    Vue.filter('solrDate',require('./filters/dateFormatFilter.js'));
    Vue.transition('flash', {
        enterClass: 'bounceInRight',
        leaveClass: 'fadeOutUp'
    });

    // General Components
    Vue.component('alert', require('./components/alert/alert.vue'));
    Vue.component('autosuggest', require('./components/autosuggest/autosuggest.vue'));
    Vue.component('badge', require('./components/badge/Badge.js'));
    Vue.component('biosample', require('./components/product/product.vue'));
    Vue.component('facet', require('./components/facetList/FacetList.js'));
    Vue.component('itemsdropdown', require('./components/itemsdropdown/itemsdropdown.vue'));
    Vue.component('pagination', require('./components/pagination/Pagination.js'));
    Vue.component('shield', require('./components/shield/shield.vue'));
    Vue.component('v-table', require('./components/table/v-table.vue'));

    window.Vue = Vue;
    window.addEventListener('load',() => {
        var baseVM = new window.Vue({el: "#app"});
    })
})(window);