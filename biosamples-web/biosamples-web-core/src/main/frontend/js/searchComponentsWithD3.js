/* eslint-disable */
/**
 * The `SearchComponent` class is the main class for the search interface containing all
 * the javascript logic to interact with the interface
 * @class SearchComponent
 * @requires underscore, vue, vue-resource, Biosamples
 * @uses Window
 */

var Console = require('./utilities/Console.js');
var d3Tools = require('./toolsFunctions.js');

var vueConsole = Console({context:'VUE', status: ['info','warning','debug','error'] });
var d3Console = Console({context:'d3', status: ['info', 'debug']});


(function(window){
    'use strict';


        // Create a plugin and pass the apiUrl using an option
        // https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
        // var doVisualization = window.visualization ? window.visualization : false;
    var {Vue, baseVM, Store, visualization: doVisualization = false } = window;

        // Required
    var _            = require('lodash');
    var _mixins      = require('./utilities/lodash-addons');

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

        /**
         * Function that take the Vue instance biosamples contained and modify it to fit to the product component
         * @param obj The VueJS instance
         * @returns {{title: (*|Array), type: string, description: string, date: *, badges: {}, link: string}}
         */
    var biosampleMap = function(obj) {


        function buildBadges(obj) {
                let badges = {};
                let objKeys = Object.keys(obj);

                // Collect badges values
                let crtNames = objKeys
                    .filter(el=>el.endsWith('_crt_json'))
                    .filter(el=>!el.startsWith('name'));

                // Process characteristics
                crtNames.forEach(name => {
                    let badgeKey = name.replace('_json','');
                    let badgeValue = obj[name].map(el=> {
                        let val = '';
                        try {
                            let elParsed = JSON.parse(el);
                            val =  elParsed.text;
                            if (elParsed.unit) {
                                val = `${val} (${elParsed.unit})`;
                            }
                        } catch (err) { console.log('Error trying to parse badgeValue:', el);}
                        return val;
                    });
                    badges[badgeKey] = badgeValue;
                });

                // Add also external references
                let extRefs = obj['external_references_name'];
                if (extRefs) {
                    try {
                        let refNames = Array.from(new Set(extRefs));
                        refNames.map(el => {

                        });
                        // let refObjSerial = obj["external_references_json"];
                        // let refObj = JSON.parse(refObjSerial);
                        // refNames.forEach(el => {
                        //     badges[`${el.toLowerCase()}Reference_crt`] =
                        //         refObj
                        //             .filter(val => val.Name == el)
                        //             .filter(val => val.Acc != obj.accession)
                        //             .map(val=>val.Acc);
                        // });
                    } catch (err) {
                        console.err('Unable to render badges for external reference', refObjSerial);
                    }
                }

                return badges;
            }

        var badges = buildBadges(obj);


            // Create the link to the specific page
        var link = obj.content_type === 'group' ?
                `${Store.groupsUrl}/${obj.accession}` :
                `${Store.samplesUrl}/${obj.accession}`;

            // Return the object we want to display
        return {
                title: obj.accession,
                subtitle: obj.name,
                type: obj.content_type,
                description: obj.description ? obj.description : '',
                date: obj.updatedate,
                badges,
                link
            };
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
                        let tempKey = key.replace(/Filter$/,'');
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
                    vueConsole.debug('Query Samples', {foo: 'foo', bar: 'bar'});

                    if (e !== undefined && typeof e.preventDefault !== 'undefined' ) {
                        e.preventDefault();
                    }

                    if (this.isQuerying) {
                        vueConsole.debug('Still getting results from previous query, new query aborted');
                        return;
                    }

                    //this.setDefaultSearchTerm();

                    let requestData = {
                        params: this.getQueryParameters(),
                        // timeout: 10000
                    };

                    this.isQuerying = true;

                    this.$http.get(`${Store.apiUrl}/search`,requestData)
                        .then((responseData) => responseData.json())
                        .then((results) => {
                            // displayRevertingFilters(results,this);
                            //let results = responseData.json();

                            if (! this.submittedQuery) {
                                this.submittedQuery = true;
                            }
                            this.consumeResults(results);
                            vueConsole.debug('Results consumed');
                            if (doVisualization) {
                                if (typeof loadD3 === 'undefined' || loadD3) {
                                    doD3Stuff(results, apiUrl, this);
                                }
                            }
                        })
                        .catch(function(error){
                            vueConsole.error('An error occurred while updating the interface: ');
                            vueConsole.error(error);
                            error = {
                                status: error.status ? error.status : '500',
                                statusText: error.statusText ? error.statusText : 'Check console for further details'
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
                    vueConsole.groupCollapsed('Consume results');
                    vueConsole.debug('Consuming ajax results');

                    var resultsInfo      = results.response;
                    if (_.isNull(resultsInfo)) {
                        alert('Request made to server was malformed, please send an email to biosamples@ebi.ac.uk');
                        return;
                    }

                    var highLights       = results.highlighting;
                    var dynamicFacets    = results.facet_counts.facet_fields;
                    var dynamicFacetsKey = _.keys(dynamicFacets);
                    this.facets          = {};
                    var vm               = this;

                    _.forEach(dynamicFacetsKey, function(key) {
                        let readableKey = key.replace('_crt_ft','');
                        readableKey = vm.$options.filters.excerpt(readableKey,200);
                        // for (var i in dynamicFacets[key]){
                        //     dynamicFacets[key][i] = vm.$options.filters.excerpt(dynamicFacets[key][i],200);
                        // }
                        vm.facets[readableKey] = readFacets(dynamicFacets[key]);
                    });

                    let dynamicFilter = Object.keys(this.filterList).map(key=>{
                        if (key !== 'content_type') {
                            return `${key}_crt`;
                        }
                    });
                    let totalFacets = dynamicFilter.reduce((all,value) => {
                        all.push(value);
                        return all;
                    }, dynamicFacetsKey);


                    vueConsole.debug('vm.facets: ', vm.facets);

                    var docs        = resultsInfo.docs;
                    var hlDocs      = this.associateHighlights(docs,highLights);

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
                        for (var i = 0; i < docs.length; i++) {
                            var currDoc = docs[i];
                            var hlElem = highlights[currDoc.id];
                            for (var el in hlElem) {
                                if (hlElem.hasOwnProperty(el)) {
                                    currDoc[el] = hlElem[el].join('');
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
                        let [filterKey,filterValue] = value.split('Filter|');
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
                    this.useFuzzy = _.getBoolean(urlParams.useFuzzySearch === 'true',false);
                    this.filterQuery = _.getObject(this.deserializeFilterQuery(urlParams.filters),{});
                },

                removeAlert(item) {
                    this.alerts.$remove(item);
                },

                removeFilter(item) {
                    let filterKey = `${item}Filter`;
                    let newFilterQuery = _.clone(this.filterQuery);
                    delete newFilterQuery[filterKey];
                    this.$set('filterQuery',newFilterQuery);
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
                        vueConsole.debug(' on page-changed');
                        this.pageNumber = newPage;
                        this.querySamples();
                    });

                    this.$on('dd-item-chosen', function(item) {
                        var previousValue = this.samplesToRetrieve;
                        this.samplesToRetrieve = item;
                        this.pageNumber = 1;
                        this.querySamples();
                    });

                    this.$on('bar-selected', function(d,loadD3) {
                        vueConsole.debug(' on bar-selected');
                        // If we desire to have an event happening without reloading d3
                        // we need to pass false as a second argument
                        this.querySamples(d,loadD3);
                    });

                    this.$on('displayChanged', function(d,loadD3) {
                        vueConsole.debug(' on displayChanged');
                        // If we desire to have an event happening without reloading d3
                        // we need to pass false as a second argument
                        this.querySamples(d,loadD3);
                    });

                    this.$on('facet-selected', function(key, value) {
                        vueConsole.debug(' on facet-selected');
                        if (value === '') {
                            Vue.delete(this.filterQuery,key);
                        } else {
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
                    var urlParam;
                    if ( !_.isEmpty(historyState.data) ) {
                        urlParam = historyState.data;
                    } else if ( !_.isEmpty(location.search) ) {
                        urlParam = _.fromQueryString(location.search.substring(1));
                        //TODO In this case the string is not properly read (filters is not read as an array)
                    } else {
                        vueConsole.debug('No Parameters');
                        urlParam = {
                            'searchTearm': '*:*'
                        };
                    }

                    this.populateDataWithUrlParameter(urlParam);
                    this.querySamples();
                },

                /**
                 * Save or update the history state if a query has been made
                 * @method saveHistoryState
                 */
                saveHistoryState: function(){
                    vueConsole.debug('Saving history','History');
                    if ( !_.isEmpty( this.currentQueryParams ) ) {
                        if ( _.isEqual( this.currentQueryParams, this.previousQueryParams ) ) {
                            vueConsole.debug('Replacing history','History');
                            History.replaceState(this.currentQueryParams, null, '?' + _.toQueryString(this.currentQueryParams));
                        } else {
                            vueConsole.debug('Push new history state','History');
                            this.previousQueryParams = this.currentQueryParams;
                            History.pushState(this.currentQueryParams, null, '?' + _.toQueryString(this.currentQueryParams));
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

function doD3Stuff( results, apiUrl, vm=0  ){
    d3Console.group('doD3Stuff');
    d3Console.debug('results: ', results);

    // If existing, clean the visualisation space
    d3.select('#vizSpotRelations').remove();

    var fill = d3.scale.category20();
    var widthTitle = window.innerWidth;
    var widthD3 = Math.floor( (70*widthTitle)/100 );
    var heightD3 = widthTitle/2;

    document.getElementById('infoVizRelations').style.height = heightD3+'px';
    if (results.response.docs.length == 0  ){
        // document.getElementById("infoVizRelations").style.visibility='hidden';
        document.getElementById('infoVizRelations').style.display='none';
        // Add display of the filters if there are existing filters ?
        // No, do it for both the sections, and do it under the search bar
    } else {
        // document.getElementById("infoVizRelations").style.visibility='visible';
        document.getElementById('infoVizRelations').style.display='block';
    }

    var margin = {top: 10, right: 10, bottom: 10, left: 10};

    if (typeof results !== 'undefined'){
        var numberFacetsUnEmpty = {};
        d3Console.debug( 'results.facet_counts: ', results.facet_counts );
        for (var u in results.facet_counts.facet_fields){
            if ( results.facet_counts.facet_fields[u][1] > 0 ){
                numberFacetsUnEmpty[u]=0;
                for (var v=0; v < results.facet_counts.facet_fields[u].length;v++){
                    if (v%2 === 0 && results.facet_counts.facet_fields[u][v+1] !== 0 ){
                        numberFacetsUnEmpty[u]++;
                    }
                }
            }
        }

        // Create elements which will call functions with the arguments necessary1
        document.getElementById('representationButton').onclick = function()
        {
            // Change to Sample if equal to Facet, and vice-versa
            if ( d3.select('#representationButton').attr('value') == 'Facet' ){
                d3Console.debug(' d3.select(\'#representationButton\').attr(\'value\') == \'Facet\' ');
                d3Console.debug(' Change to Facet ');
                d3.select('#representationButton').text('Sample');
                d3.select('#representationButton').attr('value','Sample');
                vm.$data.valueDisplay = 'Facet';
                vm.$emit('displayChanged');
            } else {
                d3Console.debug(' d3.select(\'#representationButton\').attr(\'value\') == \'Sample\' ');
                d3Console.debug(' Change to Sample ');
                d3.select('#representationButton').text('Facet');
                d3.select('#representationButton').attr('value','Facet');
                vm.$data.valueDisplay = 'Sample';
                vm.$emit('displayChanged');
            }
        };


        $(document).bind('mousemove', function(e){
            var widthWindow = $(window).width();
            var posLeft = e.pageX + 20;
            var posY = e.pageY - $('#elementHelp').height()/2 ;
            var widthTail = $('#elementHelp').width();
            if ( posLeft + widthTail >= widthWindow ){
                posLeft= e.pageX - $('#elementHelp').width;
                posY = e.pageY+20;
            }
            $('#elementHelp').css({
                left:  posLeft,
                top:   posY
            });
        });
        document.getElementById('elementHelp').style.visibility='hidden';
        document.getElementById('buttonRezInfo').style.visibility='visible';
        document.getElementById('titleRezInfo').innerHTML='Display result information';
        document.getElementById('sectionVizResult').style.display='none';

        d3Console.debug(`typeof d3.select(".node") = ${typeof d3.select('.node')}`);
        d3Console.debug(`d3.select(".node")[0][0] == null = ${d3.select('.node')[0][0] == null}`);

        d3.select('#sectionVizResult').on('mouseenter',function(){
            document.getElementById('elementHelp').style.visibility='visible';
            if ( d3.select('.node')[0][0] == null || d3.select('.node').attr('isThereSelected') == 'false' ){
                document.getElementById('textHelp').innerHTML = 'Click on a bar to display its information. <br/> Click twice to filter according to it.';
            }
        })
            .on('mouseleave',function(){
                document.getElementById('elementHelp').style.visibility='hidden';
                if ( d3.select('.node')[0][0] == null ||  d3.select('.node').attr('isThereSelected') == 'false' ){
                    d3.select('#textHelp').html('Hover over a node to make it bigger. <br/> Click on a node to display its information.');
                }
            });
        d3.select('#questionSwitch').on('mouseover',function(){
            document.getElementById('elementHelp').style.visibility='visible';
            if ( d3.select('#representationButton').attr('value')=='Sample'){
                document.getElementById('textHelp').innerHTML = 'Currently the nodes shows you the keywords that resulted from your search.<hr/> If you click on the button, it will show you samples that matched your search.';
            } else {
                document.getElementById('textHelp').innerHTML = 'Currently the nodes shows you the samples that resulted from your search.<hr/> If you click on the button, it will show you the keywords that matched your search.';
            }
        })
            .on('mouseleave',function(){
                document.getElementById('elementHelp').style.visibility='hidden';
                d3.select('#textHelp').html('Hover over a node to make it bigger. <br/> Click on a node to display its information.');
            });

        // if ( ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) ) {
        if ( ! (Object.keys(numberFacetsUnEmpty).length === 0 ) ) {
            d3Console.debug(' ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) TRUE ');
            document.getElementById('dynamicText').innerHTML= ' <h3>Clicked element information</h3>'
                +'<div id="textData"> <p> Click on an element of the diagram to display its information </p> </div>';
            var cpt = 0;
            var strResults = '<table id="table" style="width: 100%"; " > <tr>';

            for (var u in numberFacetsUnEmpty){
                if ( numberFacetsUnEmpty[u] > 0 ){
                    strResults+= '<td align="center">'+ u +'</td>';
                }
            }
            strResults+= '</tr> <tr>';
            for (var u in numberFacetsUnEmpty){
                if ( numberFacetsUnEmpty[u] > 0 ){
                    strResults+= '<td>  <div id="rezFacets'+cpt+'" height='
                        +document.getElementById('areaNodeLink').getBoundingClientRect().height/3
                        +' overflow=scroll; overflow-x=visible  > </div>   </td>';
                }
                cpt++;
            }
            strResults += '</tr> </table>';
            document.getElementById('sectionVizResult').innerHTML= strResults;
        } else {
            d3Console.debug(' ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) FALSE ');
            document.getElementById('dynamicText').innerHTML= ' <h3>Clicked element information</h3>'
                +' <div id="textData"> <p> Click on an element of the diagram to display its information </p> </div>';

            document.getElementById('sectionVizResult').innerHTML= ' <div id="tableResults"> <table  style="width:100%" <tr> <td>  </table> </div>';
        }

        document.getElementById('buttonRezInfo').onclick = function(){
            if ( document.getElementById('sectionVizResult').style.display == 'none' ){
                document.getElementById('sectionVizResult').style.display='block';
                document.getElementById('titleRezInfo').innerHTML='Hide the result information ';
                var heightBars = $('#table').height(); var heightButton = $('#buttonRezInfo').height();
                document.getElementById('sectionVizResult').style.height= (heightBars+heightButton)+ 'px';
            } else {
                document.getElementById('titleRezInfo').innerHTML='Display the result information ';
                document.getElementById('sectionVizResult').style.display='none';
            }
        };

        $('#buttonRezInfo').hover(
            function(){
                $(this).css('background-color', '#E0E0E0');
            },
            function(){
                $(this).css('background-color', 'white');
            });

        var dataBars = [];

        var barCharts=[];
        var cpt = 0;

        var height = heightD3/4;
        var width = widthTitle;

        for (var u in numberFacetsUnEmpty){
            if (numberFacetsUnEmpty[u] > 0){
                var idToSelect = '#rezFacets'+cpt;
                barCharts.push(
                    d3.select( idToSelect )
                        .insert('svg',':first-child')
                        .attr('width', function (){
                            // Possibility to modify the value for cpt == 0 if we want a special case for sample and group
                            return margin.left+margin.right + (5+10)* (numberFacetsUnEmpty[u]);
                        })
                        .attr('height', height)
                        .attr('id','resultsViz'+cpt+'')
                        .attr('class','bar')
                        .style('stroke', 'black')
                        .style('stroke-width', 1)
                        .style('border','solid')
                        .style('border-color','#5D8C83')
                        .style('border-radius','10px')
                );
            } else {
                d3Console.debug('numberFacetsUnEmpty[u] == 0', u);
            }
            cpt++;
        }

        // Visual part of barChart
        var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, height])
            .range([height, 0]);

        var widthRectangles = [];
        var cpt =0;
        for (var u in numberFacetsUnEmpty){
            widthRectangles.push(10);
            cpt++;
        }
        var maxOccurences =[];
        for (var u in results.facet_counts.facet_fields){
            maxOccurences.push(0);
            var cpt=0;
            for (var v = 0; v < results.facet_counts.facet_fields[u].length ;v++ ){
                if (typeof results.facet_counts.facet_fields[u][v] !== 'string' ){
                    if (maxOccurences[ maxOccurences.length-1 ] < results.facet_counts.facet_fields[u][v]){
                        maxOccurences[maxOccurences.length-1] = results.facet_counts.facet_fields[u][v];
                    }
                }
            }
        }

        var scalesX = []; var scalesY = [];
        var cpt=0;
        for (var u in numberFacetsUnEmpty){
            dataBars.push([]);
            scalesX.push(
                d3.scale.ordinal()
                    .domain(dataBars[cpt].map(function(d){ return d.content; }))
                    .range([margin.left, width - margin.right - margin.left])
            );

            scalesY.push(
                d3.scale.linear().domain([0, maxOccurences[cpt] ])
                    .range([ margin.bottom , height -margin.top ])
            );
            cpt++;
        }

        var cpt=0;
        for (var u in numberFacetsUnEmpty ){
            for (var v =0; v < results.facet_counts.facet_fields[u].length; v++ ){
                if (v%2 === 0 && results.facet_counts.facet_fields[u][v+1] !== 0 ){
                    dataBars[cpt].push({'content':results.facet_counts.facet_fields[u][v],
                        'readableContent':vm.$options.filters.excerpt(results.facet_counts.facet_fields[u][v],200),
                        'occurence':0 , 'x':Math.floor(v/2) * (widthRectangles[cpt] + 5) +margin.left,
                        'index':Math.floor(v/2), 'facet':u,  }) ;
                    dataBars[cpt][ dataBars[cpt].length -1 ].occurence=results.facet_counts.facet_fields[u][v+1];
                }
            }
            cpt++;
        }

        var xAxises = [];
        var yAxises = [];
        var cpt=0;
        for (var u in numberFacetsUnEmpty){
            xAxises.push (
                d3.svg.axis()
                    .scale(scalesX[cpt])
                    .orient('bottom')
            );
            yAxises.push(
                d3.svg.axis()
                    .scale(scalesY[cpt])
                    .orient('left')
            );
            cpt++;
        }

        // Text of the bar chart
        for (var h=0; h < dataBars.length; h++){
            for (var i=0; i < dataBars[h].length;i++){
                var xHere=i*(widthRectangles[h]+5)+margin.left;
                var yHere=height - margin.bottom;
                var idToSelect = '#resultsViz'+h;
                d3.select( idToSelect )
                    .append('text')
                    .attr('class','text-d3')
                    .attr('content',function(d){
                        dataBars[h][i].content;
                    })
                    .attr('occurence',function(d){
                        dataBars[h][i].occurence;
                    })
                    .attr('readableContent',function(d){
                        dataBars[h][i].readableContent;
                    })
                    .text(function(){ return dataBars[h][i].readableContent+' : '+dataBars[h][i].occurence;})
                    .attr('id', function (d){
                        var modifiedContent = d3Tools.changeSpecialCharacters(dataBars[h][i].content);
                        return 'text_'+modifiedContent;
                    })
                    .attr('idUnaltered', function (d){
                        return 'text_'+dataBars[h][i].content;
                    })
                    .attr('content',function (d){ return dataBars[h][i].content; })
                    .attr('facet',function(d){
                        return dataBars[h][i].facet;
                    })
                    .attr('readableContent',function(d){
                        return dataBars[h][i].readableContent;
                    })
                    .attr('x',function(){ return xHere + widthRectangles[h]/2 ;})
                    .attr('y', function(){ return 0; })
                    .attr('dy', '.71em')
                    .attr('opacity','1')
                    .on('mouseover',function(d){
                        document.getElementById('elementHelp').style.visibility='visible';
                        var indexToCut = this.id.indexOf('_');
                        var idToSelect = this.id.substring(indexToCut+1,this.id.length);
                        var content = d3.select('#bar_'+idToSelect).attr('content');
                        var occurence = d3.select('#bar_'+idToSelect).attr('occurence');
                        var facet = d3.select('#bar_'+idToSelect).attr('facet');

                        // document.getElementById("textHelp").innerHTML= "Help"+"<hr/> "+ facet +" <hr/> "+  content+ " : " + occurence ;
                        document.getElementById('textHelp').innerHTML= facet +' <hr/> '+  content+ ' : ' + occurence ;
                        d3.selectAll('.text-d3').style('opacity',.5);
                        d3.select(this).style('opacity',1);
                        d3.select('#bar_'+idToSelect).style('fill','steelblue');
                    })
                    .on('mouseout',function(){
                        document.getElementById('elementHelp').visibility='visible';
                        // document.getElementById("textHelp").innerHTML = "Help "
                        document.getElementById('textHelp').innerHTML = ''
                            +'Click on a bar or a text to highlight the nodes with these values.'
                            +'<hr/> Double click to filter the results according to a facet. ';

                        d3.selectAll('.text-d3').style('opacity',1);
                        d3.selectAll('.bar-d3').style('fill',function(d){
                            return d3.select(this).attr('color');
                        });
                    })
                    .on('mousedown',function(){
                        d3Console.debug('mousedown text');
                        d3.selectAll('circle').style('stroke','black');
                        var indexToCut = this.id.indexOf('_');
                        var idToSelect = this.id.substring(indexToCut+1,this.id.length);
                        var content = d3.select('#bar_'+idToSelect).attr('content');
                        var occurence = d3.select('#bar_'+idToSelect).attr('occurence');
                        var facet = d3.select('#bar_'+idToSelect).attr('facet');

                        d3.selectAll('circle').style('stroke','black');
                        d3.selectAll('.ghost_circle').style('visibility','hidden');

                        var cptHighlighted = 0;
                        var gotHighlighted = false;
                        // Choice for now: The highlighting is done by looking through the returned elements.
                        d3.select('#vizSpotRelations').selectAll('.node').select('circle').style('stroke', function(d){
                            // Actually not necessary to get the stroke, but now we have the selection done
                            gotHighlighted = false;
                            var rez = d.responseDoc;
                            for (var u in d.responseDoc){
                                var stringResponse = d.responseDoc[u]+'';
                                if ( stringResponse.indexOf ( content ) > -1 ){
                                    d3.select(this).style('stroke-opacity','1');
                                    var idGhost = '#ghost_'+rez.accession ;
                                    d3.select(idGhost).style('visibility','visible');
                                    if (!gotHighlighted){ cptHighlighted++; gotHighlighted = true; }
                                }
                            }
                        });
                        if ( d3.select('#vizSpotRelations').select('.node')[0][0].attributes.type.value == 'nodeFacet' ){
                            document.getElementById('infoPop').innerHTML=' Double click to filter the results according to the facet '
                                + content
                                +'.';
                            d3Tools.popOutDiv('infoPop');
                            d3Tools.fadeOutDiv('infoPop');
                        } else {
                            document.getElementById('infoPop').innerHTML=' Highlighting nodes according to '+content+' <br/> '+cptHighlighted+' element(s) matching.<br/>Double click to filter the results according to it.';
                            d3Tools.popOutDiv('infoPop');
                            d3Tools.fadeOutDiv('infoPop');
                        }
                    })
                    .on('dblclick',function(d){
                        d3Console.debug('dblclick text-d3');
                        var indexUnderscore = this.textContent.lastIndexOf(':');
                        var nameClickedBar = this.textContent.substring(0, indexUnderscore-1);
                        for (var u in vm.$data.facets){
                            for (var v in vm.$data.facets[u] ){
                                if ( v == 'keys'){
                                    for (var w in vm.$data.facets[u][v]){
                                        if ( nameClickedBar == vm.$data.facets[u][v][w]){
                                            var nameOfFilter = u+'Filter';
                                            if ( typeof vm.$data.filterQuery[ nameOfFilter ] == 'undefined' || vm.$data.filterQuery[ nameOfFilter ] !=  nameClickedBar ){
                                                d3Console.debug(' vm.$data.filterQuery[ nameOfFilter ] !=  nameClickedBar : CASE 1 ');
                                                vm.$data.filterQuery[ nameOfFilter ] = nameClickedBar;
                                                vm.$emit('bar-selected');
                                                document.getElementById('infoPop').innerHTML=' Filtering the results according to '+vm.$data.filterQuery[ nameOfFilter ];
                                                d3Tools.popOutDiv('infoPop');
                                                d3Tools.fadeOutDiv('infoPop');
                                                vm.$options.methods.querySamples(this,false);
                                            } else if ( vm.$data.filterQuery[ nameOfFilter ] ==  nameClickedBar ){
                                                d3Console.debug('vm.$data.filterQuery[ nameOfFilter ] ==  nameClickedBar : CASE 2 ');
                                                vm.$data.filterQuery[ nameOfFilter ] = '';

                                                vm.$emit('bar-selected');
                                                document.getElementById('infoPop').innerHTML=' Reverting the filter of the results according to '+nameClickedBar;
                                                d3Tools.popOutDiv('infoPop');
                                                d3Tools.fadeOutDiv('infoPop');
                                                vm.$options.methods.querySamples(this,false);
                                            } else {
                                                d3Console.debug('hum... what the hell is happening ? CASE 3');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                    .attr('style', 'stroke:red;writing-mode: tb; glyph-orientation-vertical: 90')
                    .style('stroke',function(d){
                        for (var i in results.responseHeader.params.filters ){
                            var indexCut = results.responseHeader.params.filters[i].indexOf('Filter');
                            var filter = results.responseHeader.params.filters[i].substring(0,indexCut);
                            if ( d3.select(this).attr('facet').indexOf(filter) > -1 ){
                                var indexCut = results.responseHeader.params.filters[i].indexOf('|');
                                var valueFilter = results.responseHeader.params.filters[i].substring(indexCut+1,results.responseHeader.params.filters[i].length);
                                if (valueFilter == d3.select(this).attr('content')){
                                    return 'red';
                                }
                            }
                        }
                        return 'black';
                    })
                ;
            }
        }

        // Rectangles of the barCharts
        for (var h=0; h < barCharts.length; h++){
            barCharts[h].selectAll('.bar-d3')
                .data(dataBars[h])
                .enter().append('rect')
                .attr('class', 'bar-d3')
                .attr('id',function(d){
                    var modifiedContent = d3Tools.changeSpecialCharacters(d.content);
                    return 'bar_'+modifiedContent;
                })
                .attr('idUnaltered',function(d){
                    d.content;
                    return 'bar_'+d.content;
                })
                .attr('facet',function(d){
                    return d.facet;
                })
                .attr('content',function(d){
                    return d.content;
                })
                .attr('occurence',function(d){
                    return d.occurence;
                })
                // space is 5
                .attr('width', widthRectangles[h] )
                .attr('fill', '#46b4af' )
                .on('mouseover',function(d,i){
                    document.getElementById('elementHelp').style.visibility='visible';
                    document.getElementById('textHelp').innerHTML=
                        // "Help"+"<hr/>"+ d.facet +" <hr/> "+d.content
                        d.facet +' <hr/> '+d.content
                        +', '+d.occurence;
                    var modifiedContent = d3Tools.changeSpecialCharacters(d.content);
                    var idToSelect = '#text_'+modifiedContent;
                    d3.selectAll('.text-d3').style('opacity',.5);
                    d3.select(idToSelect).style('opacity',1);
                    d3.select(this).style('fill','steelblue');
                })
                .on('mouseout',function(d,i){
                    document.getElementById('textHelp').innerHTML =
                        // "Help "
                        // +"<hr/> Click on a bar or a text to highlight the nodes with these values."
                        'Click on a bar or a text to highlight the nodes with these values.'
                        +'<hr/>Double click to filter the results according to a facet. ';
                    document.getElementById('elementHelp').visibility='visible';
                    d3.selectAll('.text-d3').style('opacity',1);
                    d3.selectAll('.bar-d3').style('fill',function(d){
                        return d3.select(this).attr('color');
                    });
                })
                .attr('x',function(d){return d.x;})
                .attr('y', function(d){ return height - margin.top - scalesY[h](d.occurence);} )
                .attr('height', function(d) {
                    return Math.max(0,scalesY[h](d.occurence));
                })
                .attr('opacity','0.5')
                .on('dblclick',function(d){
                    d3Console.debug('dblclick rectangle');
                    var content = d.content;
                    var nameClickedBar = d.content;
                    for (var u in vm.$data.facets){
                        for (var v in vm.$data.facets[u] ){
                            if ( v == 'keys'){
                                for (var w in vm.$data.facets[u][v]){
                                    if ( nameClickedBar == vm.$data.facets[u][v][w]){
                                        var nameOfFilter = u+'Filter';
                                        if ( typeof vm.$data.filterQuery[ nameOfFilter ] == 'undefined' || vm.$data.filterQuery[ nameOfFilter ] !=  nameClickedBar ){
                                            vm.$data.filterQuery[ nameOfFilter ] = nameClickedBar;
                                            vm.$emit('bar-selected');
                                            document.getElementById('infoPop').innerHTML=' Filtering the results according to '+content;
                                            d3Tools.popOutDiv('infoPop');
                                            d3Tools.fadeOutDiv('infoPop');
                                            vm.$options.methods.querySamples(this,false);
                                        } else if ( vm.$data.filterQuery[ nameOfFilter ] == nameClickedBar ){
                                            vm.$data.filterQuery[ nameOfFilter ] = '';
                                            vm.$emit('bar-selected');
                                            document.getElementById('infoPop').innerHTML=' Reverting the filter of the results according to '+content;
                                            d3Tools.popOutDiv('infoPop');
                                            d3Tools.fadeOutDiv('infoPop');
                                            vm.$options.methods.querySamples(this,false);
                                        } else {
                                            d3Console.warning('hum... what the hell is happening ?');
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                .on('mousedown',function(d){
                    // Filter the data. We now want to highlight selection
                    d3.selectAll('circle').style('stroke','black');
                    d3.selectAll('.ghost_circle').style('visibility','hidden');
                    var content = d.content;
                    var cptHighlighted = 0;
                    var gotHighlighted = false;
                    // Choice for now: The highlighting is done by looking through the returned elements.
                    d3.select('#vizSpotRelations').selectAll('.node').select('circle').style('stroke', function(d){
                        // Actually not necessary to get the stroke, but now we have the selection done
                        var rez = d.responseDoc;
                        gotHighlighted = false;
                        for (var u in d.responseDoc){
                            var stringResponse = d.responseDoc[u]+'';
                            if ( stringResponse.indexOf ( content ) > -1 ){
                                //this.attr("stroke-opacity","1");
                                d3.select(this).style('stroke-opacity','1');
                                //d3.select(this).style("shape-rendering","crispEdges");
                                var idGhost = '#ghost_'+rez.accession ;
                                d3.select(idGhost).style('visibility','visible');
                                if (!gotHighlighted){ cptHighlighted++; gotHighlighted = true; }
                            }
                        }
                    });

                    if ( d3.select('#vizSpotRelations').select('.node')[0][0].attributes.type.value == 'nodeFacet' ){
                        document.getElementById('infoPop').innerHTML=' Double click to filter the results according to the facet '
                            + content
                            +'.';
                        d3Tools.popOutDiv('infoPop');
                        d3Tools.fadeOutDiv('infoPop');
                    } else {
                        document.getElementById('infoPop').innerHTML=' Highlighting nodes according to '+content+' <br/> '+cptHighlighted+' element(s) matching.<br/>Double click to filter the results according to it.';
                        d3Tools.popOutDiv('infoPop');
                        d3Tools.fadeOutDiv('infoPop');
                    }
                })
                .style('fill',function(d){
                    for (var i in results.responseHeader.params.filters ){
                        var indexCut = results.responseHeader.params.filters[i].indexOf('Filter');
                        var filter = results.responseHeader.params.filters[i].substring(0,indexCut);

                        if ( d3.select(this).attr('facet').indexOf(filter) > -1 ){
                            var indexCut = results.responseHeader.params.filters[i].indexOf('|');
                            var valueFilter = results.responseHeader.params.filters[i].substring(indexCut+1,results.responseHeader.params.filters[i].length);
                            if (valueFilter == d3.select(this).attr('content')){
                                d3.select(this).attr('color','steelblue');
                                return 'steelblue';
                            }
                        }
                    }
                    d3.select(this).attr('color','#46b4af');
                    return '#46b4af';
                })
            ;
        }

        // Nodes relationships here
        var svg;
        svg = d3.select('#vizNodeLink').insert('svg')
            .attr('width', '100%')
            .attr('height', heightD3)
            .attr('id','vizSpotRelations')
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .style('border','solid')
            //.style("overflow","scroll")
            .style('border-color','#5D8C83')
            .style('border-radius','4px')
            .on('mouseenter',function(){
                document.getElementById('elementHelp').style.visibility='visible';
                // d3.select("#elementHelp").html("Help <hr/> Hover over a node to make it bigger <br/> Click a node to display its information. <br/> ");
                if ( d3.select('.node').attr('isThereSelected') == 'false' ){
                    d3.select('#textHelp').html('Hover over a node to make it bigger <br/> Click a node to display its information. <br/> ');
                }
            })
            .on('mouseleave',function(){
                document.getElementById('elementHelp').style.visibility='hidden';
                // d3.select("#elementHelp").html("Help <hr/> Hover over a node to make it bigger. <br/> Click a node to display its information. <br/> ")
                if ( d3.select('.node').attr('isThereSelected') == 'false' ){
                    d3.select('#textHelp').html(' Hover over a node to make it bigger. <br/> Click a node to display its information. <br/> ');
                }
            })
            .call(d3.behavior.zoom().on('zoom', (function (d) {
                svg.attr('transform',
                        'translate(' + d3.event.translate + ')' +
                        ' scale(' + d3.event.scale + ')'
                    );
            })
            ))
            .append('g')
        ;

        var groupsReturned={};
        var nameToNodeIndex={};
        var nodeData ={ 'stuff':[], 'nodes':[],'links':[],'group':[],'color':[] };

        if (results.response.docs.length>0){
            d3.select('#vizSpotRelations').attr('visibility','visible');
            var numFound = results.response.numFound;
            if ( typeof vm.$data.valueDisplay == 'undefined'){
                // d3Console.debug("^^^^ typeof vm.$data.valueDisplay == 'undefined' ^^^^");
                vm.$data.valueDisplay = 'Facet';
            }
            var valueDisplay = vm.$data.valueDisplay;
            if (valueDisplay == 'Sample' ){
                var resLoad = d3Tools.loadDataFromGET(results, nodeData, vm,apiUrl, nameToNodeIndex);
                nodeData=resLoad[0]; groupsReturned=resLoad[1]; nameToNodeIndex=resLoad[2];
                d3.select('#saveButton')[0][0].textContent='Get the URL to find back the current filters';
                d3Tools.draw(svg,nodeData);
            } else {
                d3.select('#saveButton')[0][0].textContent='Get the URL to find back the current filters';
                nodeData = d3Tools.loadDataFromFacets( results, nodeData, vm,apiUrl, nameToNodeIndex );
                d3Tools.drawFacets(svg,nodeData,vm);
            }
        } else {
            d3Console.warning('No results from the current query.');
            d3.select('#vizSpotRelations').attr('visibility','hidden');
            d3.select('#vizSpotRelations').selectAll('*').remove();
            document.getElementById('infoVizRelations').style.display='none';
            document.getElementById('buttonRezInfo').style.visibility='hidden';
            document.getElementById('vizSpotRelations').style.height='0px';
        }
    }
    console.groupEnd();
}
