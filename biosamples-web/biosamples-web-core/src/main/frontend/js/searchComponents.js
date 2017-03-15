
/**
 * The `SearchComponent` class is the main class for the search interface containing all
 * the javascript logic to interact with the interface
 * @class SearchComponent
 * @requires underscore, vue, vue-resource, Biosamples
 * @uses Window
 */

let Console = require("./utilities/Console.js");
// let d3Tools = require("./toolsFunctions.js");

let vueConsole = Console({context:"VUE", status: ["info","warning","debug","error"] });
// let d3Console = Console({context:"d3", status: ["info", "debug"]});


(function(window){
    "use strict";


        // Create a plugin and pass the apiUrl using an option
        // https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
        // var doVisualization = window.visualization ? window.visualization : false;
        let { Vue, baseVM, Store } = window;

        // Required
        let _            = require("lodash");
        let _mixins      = require("./utilities/lodash-addons");

        /**
         * Read Solr facets and return them as a key-value pair object
         * @method readFacets
         * @param  facets {SolR Facets} Facets returned by Solr
         * @return {Object} A key-value object representing the facets names and the count
         */
        function readFacets(facets) {
            let obj = _.create({});
            obj.keys = [];
            obj.vals = [];
            for (let i=0;i<facets.length; i = i+2) {
                if (+facets[i+1] > 0) {
                    obj[facets[i]] = +facets[i+1];
                    obj.keys.push(facets[i]);
                    obj.vals.push(+facets[i+1]);
                }
            }
            return obj;
        }

        /**
         * Function that take the Vue instance biosamples contained and modify it to fit to the product component
         * @param obj The VueJS instance
         * @returns {{title: (*|Array), type: string, description: string, date: *, badges: {}, link: string}}
         */
        let biosampleMap = function(obj) {


            function buildBadges(obj) {
                let badges = {};
                let objKeys = Object.keys(obj);

                // Collect badges values
                let crtNames = objKeys
                    .filter(el=>el.endsWith("_crt_json"))
                    .filter(el=>!el.startsWith("name"));

                // Process characteristics
                crtNames.forEach(name => {
                    let badgeKey = name.replace("_json","");
                    badges[badgeKey] = obj[name].map(el => {
                        let val = "";
                        try {
                            let elParsed = JSON.parse(el);
                            val = elParsed.text;
                            if (elParsed.unit) {
                                val = `${val} (${elParsed.unit})`;
                            }
                        } catch (err) {
                            console.log("Error trying to parse badgeValue:", el)
                        }
                        return val;
                    });
                });

                // Add also external references
                let extRefs = obj["external_references_name"];
                if (extRefs) {
                    try {
                        let refNames = Array.from(new Set(extRefs));
                        badges['externalReferencesName_crt'] =
                            // This is a useful way to hide an image if doesn't exists
                            refNames.map(name => `${name} <img style="height: 1em" onerror='this.style.display = "none"' src="images/${name.toLowerCase()}_logo.png" />&nbsp;`);
                    } catch (err) {
                        console.err("Unable to render badges for external reference", refObjSerial)
                    }
                }
                return badges;
            }

            let badges = buildBadges(obj);


            // Create the link to the specific page
            let link = obj.content_type === "group" ?
                `${Store.groupsUrl}/${obj.accession}` :
                `${Store.samplesUrl}/${obj.accession}`;

            // Return the object we want to display
            return {
                title: obj.accession,
                subtitle: obj.name,
                type: obj.content_type,
                description: obj.description ? obj.description : "",
                date: obj.updatedate,
                badges,
                link
            }
        };

        if (baseVM) {
            baseVM.$destroy();
        }
        baseVM = new Vue({
            el: '#app',
            data: {
                searchTerm: '',
                queryTerm:'',
                useFuzzy: false,
                pageNumber: 1,
                samplesToRetrieve: 10,
                isQuerying: false,
                submittedQuery: false,
                resultsNumber: 1,
                queryResults: {},
                biosamples: [],
                filterQuery: {},
                facets: {},
                previousQueryParams: {},
                currentQueryParams: {},
                alerts: [],
                facetsCollapsed: false,
                biosampleMap: biosampleMap,
                suggestedTerms: []
            },
            computed: {
                queryTermPresent() {
                    //return !_.isEmpty(this.queryTerm);
                    return true;
                },
                querySubmitted() {
                    return this.submittedQuery;
                },
                queryHasResults() {
                    return this.resultsNumber > 0;
                },
                hasAlerts() {
                    return this.alerts.length > 0;
                },
                filterList() {
                    return Object.keys(this.filterQuery).reduce((prev,key)=>{
                        let tempKey = key.replace(/Filter$/,"");
                        prev[tempKey] = this.filterQuery[key];
                        return prev;
                    },{});
                }
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

                querySamplesOnScratch(e) {
                    vueConsole.debug('querySamplesOnScratch');
                    if (e !== undefined) {
                        e.preventDefault();
                    }
                    this.useFuzzy = false;
                    this.pageNumber = 1;
                    this.samplesToRetrieve = 10;
                    this.querySamples(e);
                },

                querySamplesUsingFuzzy: function(e) {
                    vueConsole.debug('querySamplesUsingFuzzy');
                    if (e !== undefined) {
                        e.preventDefault();
                    }
                    this.useFuzzy = true;
                    this.querySamples(e);
                },

                setDefaultSearchTerm() {
                    if ( _.isEmpty(this.searchTerm) ) {
                        this.$set('searchTerm','*:*');
                    }
                },

                /**
                 * Make the request for the SolR documents
                 * @method querySamples
                 * @param  e {Event} the click event
                 */
                querySamples: function(e) {
                    vueConsole.debug("Query Samples", {foo: "foo", bar: "bar"});

                    if (e !== undefined && typeof e.preventDefault !== "undefined" ) {
                        e.preventDefault();
                    }

                    if (this.isQuerying) {
                        vueConsole.debug("Still getting results from previous query, new query aborted");
                        return;
                    }

                    //this.setDefaultSearchTerm();

                    let requestData = {
                        params: this.getQueryParameters(),
                    };

                    this.isQuerying = true;

                    this.$http.get(`${Store.apiUrl}/search`,requestData)
                        .then((responseData) => responseData.json())
                        .then((results) => {
                            if (! this.submittedQuery) {
                                this.submittedQuery = true;
                            }
                            this.consumeResults(results);
                            vueConsole.debug("Results consumed");
                        })
                        .catch(function(error){
                            vueConsole.error("An error occurred while updating the interface: ");
                            vueConsole.error(error);
                            error = {
                                status: error.status ? error.status : "500",
                                statusText: error.statusText ? error.statusText : "Check console for further details"
                            };
                            this.alerts.push({
                                type: 'danger',
                                timeout: 5000,
                                message: `Something went wrong!\nError code: ${error.status} - ${error.statusText}`
                            });
                        })
                        .then(function() {
                            this.isQuerying = false;
                        });
                },

                consumeResults: function(results) {
                    vueConsole.groupCollapsed("Consume results");
                    vueConsole.debug("Consuming ajax results");

                    let resultsInfo      = results.response;
                    if (_.isNull(resultsInfo)) {
                        alert("Request made to server was malformed, please send an email to biosamples@ebi.ac.uk");
                        return;
                    }

                    let highLights       = results.highlighting;
                    let dynamicFacets    = results.facet_counts.facet_fields;
                    // let facetOrder       = JSON.parse(results.responseHeader.params["facet.order"]);
                    // let dynamicFacetsKey = facetOrder ? facetOrder : Object.keys(dynamicFacets);
                    let dynamicFacetsKey = _.keys(dynamicFacets);
                    this.facets          = {};
                    let vm               = this;

                    _.forEach(dynamicFacetsKey, function(key) {
                        let readableKey = key.replace('_facet','');
                        //noinspection JSUnresolvedFunction
                        readableKey = vm.$options.filters.excerpt(readableKey,200);
                        vm.facets[readableKey] = readFacets(dynamicFacets[key]);
                    });

                    let dynamicFilter = Object.keys(this.filterList).map(key=>{
                        if (key !== "content_type") {
                            return `${key}_crt`
                        }
                    });
                    let totalFacets = dynamicFilter.reduce((all,value) => {
                        all.push(value);
                        return all;
                    }, dynamicFacetsKey);


                    vueConsole.debug("vm.facets: ", vm.facets);

                    let docs        = resultsInfo.docs;
                    let hlDocs      = this.associateHighlights(docs,highLights);

                    this.queryTerm        = this.searchTerm;
                    this.resultsNumber    = resultsInfo.numFound;

                    let validDocs = hlDocs.reduce((total, singleDoc) => {
                        total.push(_.assignIn(singleDoc, { dynamicFacets: totalFacets }));
                        return total;
                    },[]);


                    this.queryResults = validDocs;
                    this.biosamples = validDocs;

                    this.currentQueryParams = this.getQueryParameters();
                    this.saveHistoryState();
                    vueConsole.groupEnd();
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
                        for (let i = 0; i < docs.length; i++) {
                            let currDoc = docs[i];
                            let hlElem = highlights[currDoc.id];
                            for (let el in hlElem) {
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
                    /*
                     'organFilter': this.filterQuery.organFilter,
                     'typeFilter': this.filterQuery.typeFilter,
                     'organismFilter': this.filterQuery.organismFilter
                     */
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

                deserializeFilterQuery: function(filtersArray) {
                    let filtersObj = {};
                    // This is a little bit cumbersome, make it clearer with "Optional" object
                    if ( !_.isNil(filtersArray) && !_.isArray(filtersArray) ) {
                        filtersArray = [filtersArray];
                    }
                    _(filtersArray).forEach(function (value) {
                        let [filterKey,filterValue] = value.split("Filter|");
                        if (!_.isEmpty(filterKey)) {
                            filtersObj[`${filterKey}Filter`] = filterValue;
                        }
                    });
                    return filtersObj;
                },

                populateDataWithUrlParameter: function(urlParams) {
                    this.searchTerm = _.getString(urlParams.searchTerm,'');
                    this.samplesToRetrieve = _.getFinite(urlParams.rows,10);
                    this.pageNumber= _.getFinite(urlParams.start/this.samplesToRetrieve + 1,1);
                    this.useFuzzy = _.getBoolean(urlParams.useFuzzySearch === "true",false);
                    this.filterQuery = _.getObject(this.deserializeFilterQuery(urlParams.filters),{});
                },

                removeAlert(item) {
                    this.alerts.$remove(item);
                },

                removeFilter(item) {
                    let filterKey = `${item}Filter`;
                    let newFilterQuery = _.clone(this.filterQuery);
                    delete newFilterQuery[filterKey];
                    this.$set("filterQuery",newFilterQuery);
                    this.querySamples(undefined);
                },

                collapseFacets() {
                    this.$broadcast('collapse', this.facetsCollapsed);
                },

                /**
                 * Register event handlers for Vue custom events
                 * @method registerEventHandlers
                 */
                registerEventHandlers: function() {
                    this.$on('page-changed', function(newPage) {
                        vueConsole.debug(" on page-changed");
                        this.pageNumber = newPage;
                        this.querySamples(undefined);
                    });

                    this.$on('dd-item-chosen', function(item) {
                        this.samplesToRetrieve = item;
                        this.pageNumber = 1;
                        this.querySamples(undefined);
                    });

                    this.$on('facet-selected', function(key, value) {
                        vueConsole.debug(" on facet-selected");
                        if (value === "") {
                            Vue.delete(this.filterQuery,key);
                        } else {
                            Vue.set(this.filterQuery,key,value);
                        }
                        this.querySamples(undefined);
                    });


                },

                /**
                 * Read the location url using history API and, if not empty, lunch a query
                 * for the parameters in the url
                 * @method readLocationSearchAndQuerySamples
                 */
                readLocationSearchAndQuerySamples: function() {
                    let historyState = History.getState();
                    let urlParam;
                    if ( !_.isEmpty(historyState.data) ) {
                        urlParam = historyState.data;
                    } else if ( !_.isEmpty(location.search) ) {
                        urlParam = _.fromQueryString(location.search.substring(1));
                        //TODO In this case the string is not properly read (filters is not read as an array)
                    } else {
                        vueConsole.debug("No Parameters");
                        urlParam = {
                            "searchTearm": "*:*"
                        }
                    }

                    this.populateDataWithUrlParameter(urlParam);
                    this.querySamples(undefined);
                },

                /**
                 * Save or update the history state if a query has been made
                 * @method saveHistoryState
                 */
                saveHistoryState: function(){
                    vueConsole.debug("Saving history","History");
                    if ( !_.isEmpty( this.currentQueryParams ) ) {
                        if ( _.isEqual( this.currentQueryParams, this.previousQueryParams ) ) {
                            vueConsole.debug("Replacing history","History");
                            History.replaceState(this.currentQueryParams, null, "?" + _.toQueryString(this.currentQueryParams));
                        } else {
                            vueConsole.debug("Push new history state","History");
                            this.previousQueryParams = this.currentQueryParams;
                            History.pushState(this.currentQueryParams, null, "?" + _.toQueryString(this.currentQueryParams));
                        }
                    }
                }
            }
        });

        window.addEventListener('popstate', e => {
            e.preventDefault();
            vm.readLocationSearchAndQuerySamples();
        });
})(window);

