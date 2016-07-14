
/**
 * The `SearchComponent` class is the main class for the search interface containing all
 * the javascript logic to interact with the interface
 * @class SearchComponent
 * @requires underscore, vue, vue-resource, Biosamples
 * @uses Window
 */
(function(window,$){
    "use strict";

    // Create a plugin and pass the apiUrl using an option
    // https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
    const { apiUrl, baseUrl, table_attrs, accession} = window;

    // Required
    var _           = require("lodash");
    var Vue         = require('vue');
    var VueResource = require('vue-resource');
    var Store       = require('./components/Store.js');

    // JQuery DOM elements
    let $scroller, $scrollerContainer, $tableContainer, $table;



    Store.getInstance({
        apiUrl: apiUrl,
        baseUrl: baseUrl
    });


    // Vue Configuration
    Vue.config.debug = false;
    Vue.config.silent = true;

    // Plugins
    Vue.use(VueResource);

    // Filters & Components
    Vue.component('alert', require('./components/alert/alert.vue'));
    Vue.component('badge', require('./components/badge/Badge.js'));


    // JQuery specific functions
    function $registerElements()  {
        $scroller = $(".sample-table__scroller");
        $scrollerContainer = $(".sample-table__scroll-container");
        $tableContainer = $(".sample-table__content");
        $table = $tableContainer.find('table');
    }
    function $registerHandlers() {

        $table =  $tableContainer.find("table");
        $table.on('resize', function() {
            $scroller.width($table.width());
        });
        $scrollerContainer.on('scroll', function(e) {
            $tableContainer.scrollLeft($scrollerContainer.scrollLeft());
        });
        $tableContainer.on('scroll', function(e) {
            $scrollerContainer.scrollLeft($tableContainer.scrollLeft());
        });
    }
    function $setTableAndTopScrollSize() {
        if ( $tableContainer.width() < $table.width() ) {
            $table.css("width",'');
            $scroller.width($table.width());
        } else {
            $table.css("width","100%");
        }

    }

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

    function getErrorBadge(statusCode,responseMessage) {
        debugger;
        let alert = document.createElement("component");
        alert.setAttribute("is","alert");
        alert.setAttribute("type","danger");
        alert.textContent = "An error occured while querying biosamples";
        return alert;
    }

    function readValues(sample,field) {

        function readAnnotatedValue(value) {
            if (value.hasOwnProperty("ontology_terms")) {
                return JSON.stringify(value);
            } else {
                return value.text;
            }
        }

        let value = "";
        if (sample.hasOwnProperty(field)) {
            return value = sample[field];
        } else {
            //noinspection JSUnresolvedVariable
            if (sample.characteristics.hasOwnProperty(field)) {
                //noinspection JSUnresolvedVariable
                let multiValueField = sample.characteristics[field];

                // Concatenate the multivalue fields into a single string separated by comas where
                // annotated terms are returned in their JSON format
                return multiValueField.slice(1).reduce(function(finalString,valueField) {
                    return `${finalString}, ${readAnnotatedValue(valueField)}`;
                }, readAnnotatedValue(multiValueField[0]));
            }
        }
        return "";
    }

    var vm = new Vue({
        el: '#app',
        data: {
            group: accession,
            keyword: '',
            pageNumber: 1,
            samplesToRetrieve: 10,
            isQuerying: false,
            submittedQuery: false,
            readValues: readValues,
            resultsNumber: 1,
            groupSamples: [],
            samplesAttributes: table_attrs,
            queryResults: {},
            alerts: [],
            facetsCollapsed: false
        },
        computed: {

            queryTermPresent() {
                return !_.isEmpty(this.queryTerm);
            },
            querySubmitted() {
                return this.submittedQuery;
            },
            queryHasResults() {
                return this.resultsNumber > 0;
            },
            hasAlerts() {
                return this.alerts.length > 0;
            }
        },

        /**
         * Vue subcomponents used withing the search interface
         * @property {Object} components
         * @type {Object}
         */
        components: {
            'biosample': require('./components/product/Product.js'),
            'v-table': require('./components/table/v-table.vue'),
            'pagination': require('./components/pagination/Pagination.js'),
            'itemsDropdown': require('./components/itemsDropdown/ItemsDropdown.vue'),
        },
        /**
         * What happens when the Vue instance is ready
         * @method ready
         */
        ready: function() {
            $registerElements();
            $registerHandlers();

            this.registerEventHandlers();
            this.querySamples();
        },

        methods: {


            /**
             * Make the request for the SolR documents
             * @method querySamples
             * @param  e {Event} the click event
             */

            querySamples: function(e) {
                console.log('querySamples');
                log("Query Samples");
                if (e !== undefined && typeof e.preventDefault !== "undefined" ) {
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
                    timeout: 5000
                };

                this.isQuerying = true;

                this.$http.get(apiUrl,queryParams,ajaxOptions)
                    .then(function(results) {
                        // displayRevertingFilters(results,this);
                        if (! this.submittedQuery) {
                            this.submittedQuery = true;
                        }
                        this.consumeResults(results);
                    })
                    .catch(function(data){
                        console.log(data);
                        this.alerts.push({
                            type: 'danger',
                            timeout: 5000,
                            message: `Something went wrong!\nError code: ${data.status} - ${data.statusText}`
                        });
                    })
                    .then(function() {
                        this.isQuerying = false;
                        $setTableAndTopScrollSize();
                    });
            },

            consumeResults: function(results) {

                log("Consuming ajax results","Consume Results");

                if (_.isEmpty(results)) {
                    throw new Error("No results is available");
                }

                let paginationInfo = results.data.page;
                let embeddedObjects = results.data._embedded;
                if (_.isEmpty(embeddedObjects)) {
                    return {};
                }

                this.groupSamples = embeddedObjects.samples;
                this.resultsNumber = paginationInfo.totalElements;

            },

            /**
             * Prepare an object containing all the params for the SolR request
             * @method getQueryParameters
             * @return {Object} parameters necessary for the SolR documents request
             */
            getQueryParameters: function() {
                return {
                    'keyword': this.keyword ? this.keyword : '*',
                    'group': this.group,
                    'size': this.samplesToRetrieve,
                    'page': this.pageNumber - 1
                };
            },
            
            removeAlert(item) {
                this.alerts.$remove(item);
            },

            /**
             * Register event handlers for Vue custom events
             * @method registerEventHandlers
             */
            registerEventHandlers: function() {
                this.$on('page-changed', function(newPage) {
                    console.log(" on page-changed");
                    this.pageNumber = newPage;
                    this.querySamples();
                });

                this.$on('dd-item-chosen', function(item) {
                    var previousValue = this.samplesToRetrieve;
                    this.samplesToRetrieve = item;
                    this.pageNumber = 1;
                    this.querySamples();
                });
            },


        }
    });
})(window,jQuery);


function log(value,context) {
    if (context) {
        console.log(`[${context}] ${value}`);
    } else {
        console.log(value);
    }
}
