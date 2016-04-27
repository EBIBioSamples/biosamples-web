/**
 * The `SearchComponent` class is the main class for the search interface containing all
 * the javascript logic to interact with the interface
 * @class SearchComponent
 * @requires underscore, vue, vue-resource, Biosamples
 * @uses Window
 */
(function(window){
    "use strict";

    // Create a plugin and pass the apiURL using an option
    // https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
    if (!window.apiUrl) {
        window.apiUrl ="http://localhost:8080/biosamples/api/search/";
        window.siteUrl = "http://localhost:8080/biosamples";
    }


    // Required
    var _           = require("lodash");
    var _mixins     = require('./utilities/_mixins.js');
    var Vue         = require('vue');
    var VueResource = require('vue-resource');
    var Biosample   = require('./components/BioSample.js');
    var Store       = require('./components/Store.js');
    var apiUrl      = window.apiUrl;

    Store.getInstance({
        apiUrl: window.apiUrl,
        baseUrl: window.baseUrl
    });


    // Vue Configuration
    Vue.config.debug = true;

    // Plugins
    Vue.use(VueResource);

    // Filters & Components
    Vue.filter('excerpt',require('./filters/excerptFilter.js'));
    Vue.filter('startCase', require('./filters/startCaseFilter.js'));
    Vue.component('badge', require('./components/badge/Badge.js'));

    /**
     * Read Solr facets and return them as a key-value pair object
     * @method readFacets
     * @param  facets {SolR Facets} Facets returned by Solr
     * @return {Object} A key-value object representing the facets names and the count
     */
    function readFacets(facets) {
        var obj = _.create({});
        obj.keys = [];
        obj.vals = [];
        for (var i=0;i<facets.length; i = i+2) {
            if (+facets[i+1] > 0) {
                obj[facets[i]] = +facets[i+1];
                obj.keys.push(facets[i]);
                obj.vals.push(+facets[i+1]);
            }
        }
        return obj;
    }

    new Vue({
        el: '#app',
        data: {
            searchTerm: 'Liver',
            queryTerm:'',
            filterTerm: '',
            useFuzzy: false,
            pageNumber: 1,
            samplesToRetrieve: 10,
            isQuerying: false,
            resultsNumber: '',
            queryResults: {},
            biosamples: [],
            filterQuery: {
                // typeFilter: '',
                // organismFilter: '',
                // organFilter: ''
            },
            facets: {
                // types: {},
                // organisms: {},
                // organs: {}
            },
            previousQueryParams: {},
            currentQueryParams: {}
        },
        computed: {
            queryTermPresent: function() {
                return !_.isEmpty(this.queryTerm);
            },
            queryHasResults: function() {
                return this.resultsNumber > 0;
            }
        },

        /**
         * Vue subcomponents used withing the search interface
         * @property {Object} components
         * @type {Object}
         */
        components: {
            'biosamplesList': require('./components/productsList/ProductsList.js'),
            'pagination': require('./components/pagination/Pagination.js'),
            'itemsDropdown': require('./components/itemsDropdown/ItemsDropdown.vue'),
            'facet': require('./components/facetList/FacetList.js')
        },
        /**
         * What happens when the Vue instance is ready
         * @method ready
         */
        ready: function() {
            this.registerEventHandlers();
            this.readLocationSearchAndQuerySamples();
        },

        methods: {
            querySamplesUsingFuzzy: function(e) {

                if (e !== undefined) {
                    e.preventDefault();
                }

                this.useFuzzy = true;
                this.querySamples(e);
            },

            /**
             * Make the request for the SolR documents
             * @method querySamples
             * @param  e {Event} the click event
             */
            querySamples: function(e) {
                log("Query Samples");
                if (e !== undefined) {
                    e.preventDefault();
                }
                if (this.isQuerying) {
                    log("Still getting results from previous query, new query aborted");
                    return;
                }

                let queryParams = this.getQueryParameters();
                // Options passed to ajax request
                // Timeout set to prevent infinite waiting
                let ajaxOptions = {
                    timeout: 10000
                };

                this.isQuerying = true;

                this.$http.get(apiUrl,queryParams,ajaxOptions)
                    .then(function(results) {
                        this.consumeResults(results);
                    })
                    .catch(function(data,status,response){
                        console.log(data);
                        console.log(status);
                        console.log(response);
                    })
                    .then(function() {
                        this.isQuerying = false;
                    });
            },

            consumeResults: function(results) {

                log("Consuming ajax results","Consume Results");
                var resultsInfo      = results.data.response;
                if (_.isNull(resultsInfo)) {
                    alert("Request made to server was malformed, please send an email to biosamples@ebi.ac.uk");
                    return;
                }

                var highLights       = results.data.highlighting;
                var dynamicFacets    = results.data.facet_counts.facet_fields;
                var dynamicFacetsKey = _.keys(dynamicFacets);
                this.facets          = {};
                var vm               = this;

                _.forEach(dynamicFacetsKey, function(key) {
                    let readableKey = key.replace('_crt_ft','');
                    vm.facets[readableKey] = readFacets(dynamicFacets[key]);
                });


                var docs        = resultsInfo.docs;
                var hlDocs      = this.associateHighlights(docs,highLights);

                this.queryTerm        = this.searchTerm;
                this.resultsNumber    = resultsInfo.numFound;
                var validDocs = [];
                for (var i=0, n=hlDocs.length; i<n; i++) {
                    validDocs.push(new Biosample(hlDocs[i]));
                }

                this.queryResults = validDocs;
                this.biosamples = validDocs;


                this.currentQueryParams = this.getQueryParameters();
                this.saveHistoryState();

            },



            /**
             * Highlights the searched term within the returned SolR documents
             * @method associateHighlights
             * @param  docs {SolR Documents} Documents returned by solr
             * @param  {Object} highlights [description]
             * @return {SolR Documents} Highlighted solr documents
             */
            associateHighlights: function(docs,highlights) {
                if (typeof highlights !== 'undefined' && Object.keys(highlights).length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        var currDoc = docs[i];
                        var hlElem = highlights[currDoc.id];
                        for (var el in hlElem) {
                            if (hlElem.hasOwnProperty(el)) {
                                currDoc[el] = hlElem[el].join("");
                            }
                        }
                        docs[i] = currDoc;
                    }
                }
                return docs;
            },

            /**
             * Prepare an object containing all the params for the SolR request
             * @method getQueryParameters
             * @return {Object} parameters necessary for the SolR documents request
             */
            getQueryParameters: function() {
                return {
                    'searchTerm': this.searchTerm,
                    'rows': this.samplesToRetrieve,
                    'start': (this.pageNumber - 1) * this.samplesToRetrieve,
                    'useFuzzySearch': this.useFuzzy,
                    'filters': this.serializeFilterQuery()
                };
            },

            serializeFilterQuery: function() {
                let filterArray = [];
                _.each(this.filterQuery, (value,key) => {
                    if ( !_.isNil(value) ) {
                        filterArray.push(`${key}|${value}`);
                    }
                });
                return filterArray;
            },

            deserializeFilterQuery: function(serializedQuery) {
                // let re = new RegExp("(\w+)Filter\|(\w+)");
                let filtersObj = {};
                _(serializedQuery).forEach(function(value) {
                    // var tuple = re.exec(value);
                    // if (tuple.length == 2) {
                    //     self.filterQuery[tuple[0]] = tuple[1];
                    // }
                    let [filterKey,filterValue] = value.split("Filter|");
                    if (!_.isEmpty(filterKey)) {
                        filtersObj[filterKey] = filterValue;
                    }
                });
                return filtersObj;
            },

            populateDataWithUrlParameter: function(urlParams) {
                this.searchTerm = urlParams.searchTerm;
                this.samplesToRetrieve = _.toInteger(urlParams.rows);
                this.pageNumber= _.toInteger(urlParams.start)/this.samplesToRetrieve + 1;
                this.useFuzzy = urlParams.useFuzzySearch === "true";
                this.filterQuery = this.deserializeFilterQuery(urlParams.filters);
            },

            /**
             * Register event handlers for Vue custom events
             * @method registerEventHandlers
             */
            registerEventHandlers: function() {
                this.$on('page-changed', function(newPage) {
                    this.pageNumber = newPage;
                    this.querySamples();
                });
                this.$on('dd-item-chosen', function(item) {
                    var previousValue = this.samplesToRetrieve;
                    this.samplesToRetrieve = item;
                    this.pageNumber = 1;
                    this.querySamples();
                });

                this.$on('facet-selected', function(key, value) {
                    if (value === "") {
                        console.log("Removed filter: [" + key + "]");
                        Vue.delete(this.filterQuery,key);
                    } else {
                        console.log("Set filter: [" + key + "]=" + value);
                        Vue.set(this.filterQuery,key,value);
                    }
                    this.querySamples();
                });
            },

            /**
             * Read the location url using history API and, if not empty, lunch a query
             * for the parameters in the url
             * @method readLocationSearchAndQuerySamples
             */
            readLocationSearchAndQuerySamples: function() {
                var historyState = History.getState();
                var urlParam = historyState.data;
                if (! _.isEmpty(urlParam) ) {
                    this.populateDataWithUrlParameter(urlParam);
                    this.querySamples();
                } else {
                    console.log("No parameters")
                }
            },

            /**
             * Save or update the history state if a query has been made
             * @method saveHistoryState
             */
            saveHistoryState: function() {
                log("Saving history","History");
                if ( !_.isEmpty( this.currentQueryParams ) ) {
                    if ( _.isEqual( this.currentQueryParams, this.previousQueryParams ) ) {
                        log("Replacing history","History");
                        History.replaceState(this.currentQueryParams, 'test', _.toQueryString(this.currentQueryParams));
                    } else {
                        log("Push new history state","History");
                        this.previousQueryParams = this.currentQueryParams;
                        History.pushState(this.currentQueryParams, 'test', _.toQueryString(this.currentQueryParams));
                    }
                }
            }

        }

    });



})(window);

function log(value,context) {
    if (context) {
        console.log( context + " - " + value);
    } else {
        console.log(value);
    }
}