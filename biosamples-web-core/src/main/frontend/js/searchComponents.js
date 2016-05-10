/**
 * The `SearchComponent` class is the main class for the search interface containing all
 * the javascript logic to interact with the interface
 * @class SearchComponent
 * @requires underscore, vue, vue-resource, Biosamples
 * @uses Window
 */
(function(window){
    "use strict";

    // Create a plugin and pass the apiUrl using an option
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
    Vue.config.debug = false;
    Vue.config.silent = true;

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

    var vm = new Vue({
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
              this.querySamples();
          },
            
            /**
             * Make the request for the SolR documents
             * @method querySamples
             * @param  e {Event} the click event
             */

            querySamples: function(e) {
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
                    timeout: 10000
                };

                this.isQuerying = true;

                this.$http.get(apiUrl,queryParams,ajaxOptions)
                    .then(function(results) {

                        displayRevertingFilters(results,this);

                        this.consumeResults(results);
                        if ( typeof loadD3 === "undefined" || loadD3 ){
                            doD3Stuff(results,apiUrl,this);
                        }
                    })
                    .catch(function(data,status,response){
                        console.log("data");console.log(data);
                        console.log("status");console.log(status);
                        console.log("response");console.log(response);
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

                    console.log(" on page-changed");

                    this.pageNumber = newPage;
                    this.querySamples();
                });

                this.$on('dd-item-chosen', function(item) {
                    console.log("dd-item-chosen : ");
                    console.log("item : ");console.log(item);
                    var previousValue = this.samplesToRetrieve;
                    this.samplesToRetrieve = item;
                    console.log("this : "); console.log(this);
                    console.log('this.samplesToRetrieve : ');
                    console.log(this.samplesToRetrieve);
                    this.pageNumber = 1;
                    this.querySamples();
                });

                this.$on('bar-selected', function(d,loadD3) {
                  console.log(" on bar-selected");
                  // If we desire to have an event happening without reloading d3
                  // we need to pass false as a second argument 
                  this.querySamples(d,loadD3);
                });

                this.$on('facet-selected', function(key, value) {
                    console.log(" on facet-selected");
                    if (value === "") {
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
                var urlParam = historyState.data;
                if (! _.isEmpty(urlParam) ) {
                    this.populateDataWithUrlParameter(urlParam);
                    this.querySamples();
                    //vm.querySamples();
                } else {
                    console.log("No parameters");
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

function doD3Stuff( results, apiUrl, vm=0  ){
  console.log("_______doD3Stuff______");
  console.log("results : ");console.log(results);

  // If existing, clean the visualisation space
  d3.select("#vizSpotRelations").remove();

  var fill = d3.scale.category20();
  var widthTitle = window.innerWidth;
  var widthD3 = Math.floor( (70*widthTitle)/100 );
  var heightD3 = widthTitle/2;

  document.getElementById("infoVizRelations").style.height = heightD3+'px';  
  if (results.data.response.docs.length == 0  ){
    document.getElementById("infoVizRelations").style.visibility='hidden';
    // Add display of the filters if there are existing filters ? 
    // No, do it for both the sections, and do it under the search bar
            
  } else {
    document.getElementById("infoVizRelations").style.visibility='visible';
  }

  var margin = {top: 10, right: 10, bottom: 10, left: 10};

  if (typeof results !== 'undefined'){

    var numberFacetsUnEmpty = {};
    console.log( "results.data.facet_counts : " );
    console.log( results.data.facet_counts );
    for (var u in results.data.facet_counts.facet_fields){
      if ( results.data.facet_counts.facet_fields[u][1] > 0 ){
        numberFacetsUnEmpty[u]=0;
          for (var v=0; v < results.data.facet_counts.facet_fields[u].length;v++){
            if (v%2 === 0 && results.data.facet_counts.facet_fields[u][v+1] !== 0 ){ 
              numberFacetsUnEmpty[u]++;
            }
          }
      }
    }

    document.getElementById("elementHelp").style.visibility="hidden";
    document.getElementById("elementHelp").innerHTML="Help";
    
    document.getElementById("buttonRezInfo").style.visibility="visible";
    document.getElementById("titleRezInfo").innerHTML="Display result information";
    document.getElementById("sectionVizResult").style.visibility="hidden";

    d3.select("#sectionVizResult").on("mouseenter",function(){
      document.getElementById("elementHelp").style.visibility="visible";
      document.getElementById("elementHelp").innerHTML = "Help <hr/> Click a node to display its information. <br/> Click twice to filter according to it.";
    })

    .on("mouseleave",function(){
      document.getElementById("elementHelp").style.visibility="hidden";
      document.getElementById("elementHelp").innerHTML = "Help ";
    })

    if ( ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) ) {
        console.log(" ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) TRUE ");
      document.getElementById("dynamicText").innerHTML= ' <h3>Clicked element information</h3>'
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
          +document.getElementById("areaNodeLink").getBoundingClientRect().height/3
          +' overflow=scroll; overflow-x=visible  > </div>   </td>';
        }
        cpt++;
      }
      strResults += '</tr> </table>';
      document.getElementById("sectionVizResult").innerHTML= strResults;
      document.getElementById("sectionVizResult").style.height="0px";
    } else {
      console.log(" ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) FALSE ");
      document.getElementById("dynamicText").innerHTML= ' <h3>Clicked element information</h3>'
      +' <div id="textData"> <p> Click on an element of the diagram to display its information </p> </div>';

      document.getElementById("sectionVizResult").innerHTML= ' <div id="tableResults"> <table  style="width:100%" <tr> <td>  </table> </div>';
      document.getElementById("sectionVizResult").style.height="0px";
    }
    
    document.getElementById("buttonRezInfo").onclick = function(){
      if ( document.getElementById("sectionVizResult").style.visibility == "hidden" ){
        document.getElementById("sectionVizResult").style.visibility="visible";
        document.getElementById("titleRezInfo").innerHTML="Hide the result information ";
        var heightBars = $('#resultsViz0').height();
        document.getElementById("sectionVizResult").style.height= (heightBars+100)+ "px";
      } else {
        document.getElementById("sectionVizResult").style.visibility="hidden";
        document.getElementById("titleRezInfo").innerHTML="Display the result information ";
        document.getElementById("sectionVizResult").style.height="0px";
      }
    };

    $("#buttonRezInfo").hover(
      function(){
        $(this).css("background-color", "#E0E0E0");        
      }, 
      function(){
        $(this).css("background-color", "white");        
      });

    console.log("numberFacetsUnEmpty : ");
    console.log(numberFacetsUnEmpty);

    var dataBars = [];

    var barCharts=[];
    var cpt = 0;

    var height = heightD3/4;
    var width = widthTitle;

    for (var u in numberFacetsUnEmpty){
      if (numberFacetsUnEmpty[u] > 0){
        var idToSelect = "#rezFacets"+cpt;
        barCharts.push(
          d3.select( idToSelect )
            .insert("svg",":first-child")
            .attr("width", function (){
              // Possibility to modify the value for cpt == 0 if we want a special case for sample and group
              return margin.left+margin.right + (5+10)* (numberFacetsUnEmpty[u]);
            })
            .attr("height", height)
            //.attr("height", heightD3)
            .attr("id","resultsViz"+cpt+"")
            .attr("class","bar")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("border","solid")
            .style("border-color","#5D8C83")
            .style("border-radius","10px")
        );
      } else {
        console.log("numberFacetsUnEmpty[u] == 0");console.log(u);
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
    for (var u in results.data.facet_counts.facet_fields){
      maxOccurences.push(0);
      var cpt=0;
      for (var v = 0; v < results.data.facet_counts.facet_fields[u].length ;v++ ){
        if (typeof results.data.facet_counts.facet_fields[u][v] !== "string" ){
          if (maxOccurences[ maxOccurences.length-1 ] < results.data.facet_counts.facet_fields[u][v]){
            maxOccurences[maxOccurences.length-1] = results.data.facet_counts.facet_fields[u][v];
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
    console.log("results.data.facet_counts.facet_fields : ");console.log(results.data.facet_counts.facet_fields);
    for (var u in numberFacetsUnEmpty ){
      for (var v =0; v < results.data.facet_counts.facet_fields[u].length; v++ ){
        if (v%2 === 0 && results.data.facet_counts.facet_fields[u][v+1] !== 0 ){
          dataBars[cpt].push({"content":results.data.facet_counts.facet_fields[u][v],
           "occurence":0 , "x":Math.floor(v/2) * (widthRectangles[cpt] + 5) +margin.left,
           "index":Math.floor(v/2), "facet":u,  }) ;
          dataBars[cpt][ dataBars[cpt].length -1 ].occurence=results.data.facet_counts.facet_fields[u][v+1];
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
        .orient("bottom")
      )
      yAxises.push(
        d3.svg.axis()
          .scale(scalesY[cpt])
          .orient("left")
      )
      cpt++;
    }

    // Text of the bar chart
    for (var h=0; h < dataBars.length; h++){
      for (var i=0; i < dataBars[h].length;i++){
        var xHere=i*(widthRectangles[h]+5)+margin.left;
        var yHere=height - margin.bottom;
        var idToSelect = "#resultsViz"+h;
        d3.select( idToSelect )
          .append("text")
            .attr("class","text-d3")
            .attr("content",function(d){
              dataBars[h][i].content;
            })
            .attr("occurence",function(d){
              dataBars[h][i].occurence;
            })            
            .attr("id", function (d){
                var modifiedContent = changeSpecialCharacters(dataBars[h][i].content);
              return 'text_'+modifiedContent;
            })
            .attr("idUnaltered", function (d){
              return 'text_'+dataBars[h][i].content;
            })            
            .attr("content",function (d){ return dataBars[h][i].content; })
            .attr("facet",function(d){
                return dataBars[h][i].facet;
            })
            .attr("x",function(){ return xHere + widthRectangles[h]/2 ;})
            .attr("y", function(){ return 0; })
            .attr("dy", ".71em")
            .attr("opacity","1")
            .on("mouseover",function(d){
              document.getElementById("elementHelp").style.visibility="visible";
              var indexToCut = this.id.indexOf("_");
              var idToSelect = this.id.substring(indexToCut+1,this.id.length)

              var content = d3.select('#bar_'+idToSelect).attr("content");
              var occurence = d3.select('#bar_'+idToSelect).attr("occurence");
              var facet = d3.select('#bar_'+idToSelect).attr("facet");

              document.getElementById("elementHelp").innerHTML=
                "Help"
                +"<hr/> "+ facet +" <hr/> "+  content+ " : " + occurence ;
              d3.selectAll(".text-d3").style("opacity",.5);
              d3.select(this).style("opacity",1);
              d3.select('#bar_'+idToSelect).style("fill","steelblue");
            })
            .on("mouseout",function(){
              document.getElementById("elementHelp").visibility="visible";
              document.getElementById("elementHelp").innerHTML = "Help "
              +"<hr/> • Click on a bar or a text to highlight the nodes with these values."
              +"<br/> • Double click to filter the results according to a facet. ";              

              d3.selectAll(".text-d3").style("opacity",1);
              d3.selectAll(".bar-d3").style("fill",function(d){
                return d3.select(this).attr("color");
              });
            })
            .on("mousedown",function(){
              console.log("mousedown text");
              d3.selectAll("circle").style("stroke","black");

              var indexToCut = this.id.indexOf("_");
              var idToSelect = this.id.substring(indexToCut+1,this.id.length)
              
              var content = d3.select('#bar_'+idToSelect).attr("content");
              var occurence = d3.select('#bar_'+idToSelect).attr("occurence");
              var facet = d3.select('#bar_'+idToSelect).attr("facet");

              d3.selectAll("circle").style("stroke","black");
              d3.selectAll(".ghost_circle").style("visibility","hidden");

              var cptHighlighted = 0;
              var gotHighlighted = false;
              // Choice for now: The highlighting is done by looking through the returned elements.
              d3.select("#vizSpotRelations").selectAll(".node").select("circle").style("stroke", function(d){
                    // Actually not necessary to get the stroke, but now we have the selection done
                    gotHighlighted = false;
                    var rez = d.responseDoc;
                    for (var u in d.responseDoc){
                      var stringResponse = d.responseDoc[u]+'';
                      if ( stringResponse.indexOf ( content ) > -1 ){
                        d3.select(this).style("stroke-opacity","1");
                        var idGhost = "#ghost_"+rez.accession ;
                        d3.select(idGhost).style("visibility","visible");
                        if (!gotHighlighted){ cptHighlighted++; gotHighlighted = true; }
                      }
                    }
              })
              if ( d3.select("#vizSpotRelations").select(".node")[0][0].attributes.type.value == "nodeFacet" ){
                  document.getElementById("infoPop").innerHTML=" Double click to filter the results according to the facet "
                    + content
                    +".";
                  popOutDiv("infoPop");
                  fadeOutDiv("infoPop");
              } else { 
                  document.getElementById("infoPop").innerHTML=" Highlighting nodes according to "+content+" <br/> "+cptHighlighted+" element(s) matching.<br/>Double click to filter the results according to it.";
                  popOutDiv("infoPop");
                  fadeOutDiv("infoPop");
              }
            })
            .on("dblclick",function(d){
              console.log("dblclick text-d3");
                var indexUnderscore = this.textContent.lastIndexOf(":");
                var nameClickedBar = this.textContent.substring(0, indexUnderscore-1);
                for (var u in vm.$data.facets){
                  for (var v in vm.$data.facets[u] ){
                    if ( v == "keys"){
                      for (var w in vm.$data.facets[u][v]){
                        if ( nameClickedBar == vm.$data.facets[u][v][w]){
                          var nameOfFilter = u+'Filter';
                          if ( typeof vm.$data.filterQuery[ nameOfFilter ] == 'undefined' || vm.$data.filterQuery[ nameOfFilter ] !=  nameClickedBar ){
                            console.log(" vm.$data.filterQuery[ nameOfFilter ] !=  nameClickedBar : CASE 1 ");
                            vm.$data.filterQuery[ nameOfFilter ] = nameClickedBar;
                            vm.$emit("bar-selected");
                            document.getElementById("infoPop").innerHTML=" Filtering the results according to "+vm.$data.filterQuery[ nameOfFilter ];
                            popOutDiv("infoPop");
                            fadeOutDiv("infoPop");
                            vm.$options.methods.querySamples(this,false);
                          } else if ( vm.$data.filterQuery[ nameOfFilter ] ==  nameClickedBar ){
                            console.log("vm.$data.filterQuery[ nameOfFilter ] ==  nameClickedBar : CASE 2 ");
                            vm.$data.filterQuery[ nameOfFilter ] = '';

                            vm.$emit("bar-selected");
                            document.getElementById("infoPop").innerHTML=" Reverting the filter of the results according to "+nameClickedBar;
                            popOutDiv("infoPop");
                            fadeOutDiv("infoPop");
                            vm.$options.methods.querySamples(this,false);
                          } else {
                            console.log("hum... what the hell is happening ? CASE 3");
                          }
                        }
                      }
                    }
                  }
                }
            })
            .attr("style", "stroke:red;writing-mode: tb; glyph-orientation-vertical: 90")
            .text(function(){ return dataBars[h][i].content+' : '+dataBars[h][i].occurence;})
            .style("stroke",function(d){
                for (var i in results.request.params.filters ){
                    var indexCut = results.request.params.filters[i].indexOf("Filter");
                    var filter = results.request.params.filters[i].substring(0,indexCut);

                    if ( d3.select(this).attr("facet").indexOf(filter) > -1 ){
                        var indexCut = results.request.params.filters[i].indexOf("|");
                        var valueFilter = results.request.params.filters[i].substring(indexCut+1,results.request.params.filters[i].length);
                        if (valueFilter == d3.select(this).attr("content")){
                            //d3.select(this).attr.color = "red";
                            return "red";
                        }
                    }
                }
                return "black";
            })
        ;
      }      
    }

    // Rectangles of the barCharts
    for (var h=0; h < barCharts.length; h++){
      barCharts[h].selectAll(".bar-d3")
        .data(dataBars[h])
        .enter().append("rect")
        .attr("class", "bar-d3")
        .attr("id",function(d){
            var modifiedContent = changeSpecialCharacters(d.content);
            return 'bar_'+modifiedContent;
        })
        .attr("idUnaltered",function(d){
            d.content;
            return 'bar_'+d.content;
        })
        .attr("facet",function(d){ 
          return d.facet;
        })
        .attr("content",function(d){ 
          return d.content;
        })
        .attr("occurence",function(d){ 
          return d.occurence;
        })
        // space is 5
        .attr("width", widthRectangles[h] )
        .attr("fill", "#46b4af" )
        .on("mouseover",function(d,i){
          document.getElementById("elementHelp").style.visibility="visible";
          document.getElementById("elementHelp").innerHTML=
            "Help"
            +"<hr/>"+ d.facet +" <hr/> "+d.content
            +", "+d.occurence;
          var modifiedContent = changeSpecialCharacters(d.content);
          var idToSelect = '#text_'+modifiedContent;
          d3.selectAll(".text-d3").style("opacity",.5);
          d3.select(idToSelect).style("opacity",1);
          d3.select(this).style("fill","steelblue");
        })
        .on("mouseout",function(d,i){
          document.getElementById("elementHelp").innerHTML = "Help "
          +"<hr/> • Click on a bar or a text to highlight the nodes with these values."
          +"<br/> • Double click to filter the results according to a facet. ";        
          document.getElementById("elementHelp").visibility="visible";
          d3.selectAll(".text-d3").style("opacity",1);
          //d3.select(this).style("fill","#46b4af");
          d3.selectAll(".bar-d3").style("fill",function(d){
            return d3.select(this).attr("color");
          });
        })
        .attr("x",function(d){return d.x;})
        .attr("y", function(d){ return height - margin.top - scalesY[h](d.occurence);} )
        .attr("height", function(d) {
            return Math.max(0,scalesY[h](d.occurence)); 
        })
        .attr("opacity","0.5")
        .on("dblclick",function(d){
          console.log("dblclick rectangle");
          var content = d.content;
          var nameClickedBar = d.content;

          for (var u in vm.$data.facets){
            for (var v in vm.$data.facets[u] ){
              if ( v == "keys"){
                for (var w in vm.$data.facets[u][v]){
                  if ( nameClickedBar == vm.$data.facets[u][v][w]){
                    var nameOfFilter = u+'Filter';
                    if ( typeof vm.$data.filterQuery[ nameOfFilter ] == 'undefined' || vm.$data.filterQuery[ nameOfFilter ] !=  nameClickedBar ){
                      console.log("time to filter");
                      console.log("nameOfFilter : ");console.log(nameOfFilter);
                      console.log("nameClickedBar : "+nameClickedBar);
                      vm.$data.filterQuery[ nameOfFilter ] = nameClickedBar;
                      vm.$emit("bar-selected");
                      document.getElementById("infoPop").innerHTML=" Filtering the results according to "+content;
                      popOutDiv("infoPop");
                      fadeOutDiv("infoPop");
                      vm.$options.methods.querySamples(this,false);
                    } else if ( vm.$data.filterQuery[ nameOfFilter ] == nameClickedBar ){
                      vm.$data.filterQuery[ nameOfFilter ] = '';
                      vm.$emit("bar-selected");
                      document.getElementById("infoPop").innerHTML=" Reverting the filter of the results according to "+content;
                      popOutDiv("infoPop");
                      fadeOutDiv("infoPop");
                      vm.$options.methods.querySamples(this,false);
                    } else {
                      console.log("hum... what the hell is happening ?");
                    }
                  }
                }
              }
            }
          }
        })
        .on("mousedown",function(d){
          // Filter the data. We now want to highlight selection
          d3.selectAll("circle").style("stroke","black");
          d3.selectAll(".ghost_circle").style("visibility","hidden");
          var content = d.content;
          var cptHighlighted = 0;
          var gotHighlighted = false;
          // Choice for now: The highlighting is done by looking through the returned elements.
          d3.select("#vizSpotRelations").selectAll(".node").select("circle").style("stroke", function(d){        
            // Actually not necessary to get the stroke, but now we have the selection done
            var rez = d.responseDoc;
            gotHighlighted = false;
            for (var u in d.responseDoc){
              var stringResponse = d.responseDoc[u]+'';
              if ( stringResponse.indexOf ( content ) > -1 ){
                //this.attr("stroke-opacity","1");
                d3.select(this).style("stroke-opacity","1");
                //d3.select(this).style("shape-rendering","crispEdges");
                var idGhost = "#ghost_"+rez.accession ;
                d3.select(idGhost).style("visibility","visible");
                if (!gotHighlighted){ cptHighlighted++; gotHighlighted = true; }
              }
            }
          });

          if ( d3.select("#vizSpotRelations").select(".node")[0][0].attributes.type.value == "nodeFacet" ){
              document.getElementById("infoPop").innerHTML=" Double click to filter the results according to the facet "
                + content
                +".";
              popOutDiv("infoPop");
              fadeOutDiv("infoPop");
          } else { 
              document.getElementById("infoPop").innerHTML=" Highlighting nodes according to "+content+" <br/> "+cptHighlighted+" element(s) matching.<br/>Double click to filter the results according to it.";
              popOutDiv("infoPop");
              fadeOutDiv("infoPop");
          }
        })
        .style("fill",function(d){
            for (var i in results.request.params.filters ){
                var indexCut = results.request.params.filters[i].indexOf("Filter");
                var filter = results.request.params.filters[i].substring(0,indexCut);

                if ( d3.select(this).attr("facet").indexOf(filter) > -1 ){
                    var indexCut = results.request.params.filters[i].indexOf("|");
                    var valueFilter = results.request.params.filters[i].substring(indexCut+1,results.request.params.filters[i].length);
                    if (valueFilter == d3.select(this).attr("content")){
                        d3.select(this).attr("color","steelblue");
                        return "steelblue";
                    }
                }
            }
            d3.select(this).attr("color","#46b4af");
            return "#46b4af";
        })
        ;
    }


    // Nodes relationships here
    var svg;
    svg = d3.select("#vizNodeLink").insert("svg")
      .attr("width", "100%")
      .attr("height", heightD3)
      .attr("id","vizSpotRelations")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("border","solid")
      //.style("overflow","scroll")
      .style("border-color","#5D8C83")
      .style("border-radius","4px")
      .on("mouseenter",function(){
        document.getElementById("elementHelp").style.visibility="visible";
        d3.select("#elementHelp").html("Help <hr/> Click a node to display its information. <br/> Click twice to filter according to it.");
      })
      .on("mouseleave",function(){
        document.getElementById("elementHelp").style.visibility="hidden";
        d3.select("#elementHelp").html("Help");
      })
      .call(d3.behavior.zoom().on("zoom", (function (d) {
          svg.attr("transform", 
            "translate(" + d3.event.translate + ")" + 
            " scale(" + d3.event.scale + ")"
            );
        })
      ))
      .append("g")
      ;

    var groupsReturned={};
    var nameToNodeIndex={};
    var nodeData ={ "stuff":[], "nodes":[],"links":[],"group":[],"color":[] };

    if (results.data.response.docs.length>0){
      console.log("results.data.response.docs.length>0");
      d3.select("#vizSpotRelations").attr("visibility","visible");

      var numFound = results.data.response.numFound;
      var numberToDisplay = 250;
      if (numFound <= numberToDisplay ){
          var resLoad = loadDataFromGET(results, nodeData, vm,apiUrl, nameToNodeIndex);
          nodeData=resLoad[0]; groupsReturned=resLoad[1]; nameToNodeIndex=resLoad[2];
          draw(svg,nodeData);
      } else {
          console.log('numFound > numberToDisplay');
          // var resLoad = loadDataFromGET(results, nodeData, vm,apiUrl, nameToNodeIndex);
          // nodeData=resLoad[0]; groupsReturned=resLoad[1]; nameToNodeIndex=resLoad[2];
          // draw(svg,nodeData);
          nodeData = loadDataFromFacets( results, nodeData, vm,apiUrl, nameToNodeIndex );
          drawFacets(svg,nodeData,vm);
      }
    } else {
        console.log("results.data.response.docs.length==0");
        d3.select("#vizSpotRelations").attr("visibility","hidden");
        d3.select("#vizSpotRelations").selectAll("*").remove();
        document.getElementById("infoVizRelations").style.visibility="hidden";
        document.getElementById("buttonRezInfo").style.visibility="hidden";
        document.getElementById("infoVizRelations").style.height="0px";
        document.getElementById("vizSpotRelations").style.height="0px";
    }

  }
}
