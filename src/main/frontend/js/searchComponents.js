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
    }


    // Required
    var _           = require("lodash");
    var _mixins     = require('./utilities/_mixins.js');
    var Vue         = require('vue');
    var VueResource = require('vue-resource');
    var Biosample   = require('./components/BioSample.js');
    var apiUrl      = window.apiUrl;


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
          querySamples: function(e,loadD3) {
            if (e !== undefined && typeof e.preventDefault !== "undefined" ) {
                e.preventDefault();
            }
            if (_.isEmpty(this.searchTerm)) {
                return;
            }
            var queryParams = this.getQueryParameters();
            var server = apiUrl + "query";

            this.$http.get(server,queryParams)
                .then(function(results){

              console.log("first results : ");console.log(results);
              this.currentQueryParams = queryParams;  

              var resultsInfo = results.data.response;
              var highLights = results.data.highlighting;
              var types = results.data.facet_counts.facet_fields.content_type;
              var organisms = results.data.facet_counts.facet_fields.organism_crt;
              var organs = results.data.facet_counts.facet_fields.organ_crt;
              var docs = resultsInfo.docs;
              var hlDocs = this.associateHighlights(docs, highLights);
              
              this.queryTerm = this.searchTerm;
              this.resultsNumber = resultsInfo.numFound;
              this.facets.types = readFacets(types);
              this.facets.organisms = readFacets(organisms);
              this.facets.organs = readFacets(organs);
              
              var validDocs = [];
              for (var i = 0, n = hlDocs.length; i < n; i++) {
                validDocs.push(new Biosample(hlDocs[i]));
              }
              this.queryResults = validDocs;
              this.biosamples = validDocs;

              // Variable to know whether we just to a get to
              // just get data or reload the scene
              if ( typeof loadD3 === "undefined" || loadD3 ){
                doD3Stuff(results,server,vm);
              }
            })
            .catch(function(data,status,response){
              console.log("data : ");console.log(data);
              console.log("status : ");console.log(status);
              console.log("response : ");console.log(response);
            });
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

            populateDataWithUrlParameter: function(urlParams) {
                this.searchTerm = urlParams.searchTerm;
                this.samplesToRetrieve = _.toInteger(urlParams.rows);
                this.pageNumber= _.toInteger(urlParams.start)/this.samplesToRetrieve + 1;
                this.useFuzzy = urlParams.useFuzzySearch === "true" ? true : false;
                // this.filterQuery.organFilter = urlParams.organFilter;
                // this.filterQuery.typeFilter = urlParams.typeFilter;
                // this.filterQuery.organismFilter = urlParams.organismFilter;
            },

            /**
             * Register event handlers for Vue custom events
             * @method registerEventHandlers
             */
            registerEventHandlers: function() {
                this.$on('page-changed', function(newPage) {
                    this.pageNumber = newPage;
                    this.saveHistoryState();
                    this.querySamples();
                });
                this.$on('dd-item-chosen', function(item) {
                    var previousValue = this.samplesToRetrieve;
                    this.samplesToRetrieve = item;
                    this.pageNumber = 1;
                    this.saveHistoryState();
                    this.querySamples();
                });

                this.$on('bar-selected', function(d,loadD3) {
                  // If we desire to have an event happening without reloading d3
                  // we need to pass false as a second argument to querySamples function
                  this.querySamples(d,loadD3);
                });

                this.$on('facet-selected', function(key, value) {
                    if (value === "") {
                        Vue.delete(this.filterQuery,key);
                    } else {
                        Vue.set(this.filterQuery,key,value);
                    }
                    this.saveHistoryState();
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
                    //vm.populateDataWithUrlParameter(urlParam);
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
                if ( !_.isEmpty( this.currentQueryParams ) ) {
                    if ( _.isEqual( this.currentQueryParams, this.previousQueryParams ) ) {
                        History.replaceState(this.currentQueryParams, 'test', _.toQueryString(this.currentQueryParams));
                    } else {
                        this.previousQueryParams = this.currentQueryParams;
                        History.pushState(this.currentQueryParams, 'test', _.toQueryString(this.currentQueryParams));
                    }
                }
            }

        }

    });



})(window);


function doD3Stuff( results, server, vm=0  ){
  console.log("_______doD3Stuff______");
  var margin = {top: 10, right: 10, bottom: 10, left: 10};

  if (typeof results !== 'undefined'){

    var numberFacetsUnEmpty = {};
    for (var u in results.data.facet_counts.facet_fields){
      numberFacetsUnEmpty[u]=0;
      for (var v=0; v < results.data.facet_counts.facet_fields[u].length;v++){
        if (v%2 === 0 && results.data.facet_counts.facet_fields[u][v+1] !== 0 ){ 
          numberFacetsUnEmpty[u]++;
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
      document.getElementById("elementHelp").innerHTML = "Help "
      +"<hr/> • Click on a bar or a text to highlight the nodes with these values."
      +"<br/> • Double click to filter the results according to a facet. ";
    })

    .on("mouseleave",function(){
      document.getElementById("elementHelp").style.visibility="hidden";
      document.getElementById("elementHelp").innerHTML = "Help ";
    })


    if ( ! (Object.keys(numberFacetsUnEmpty).length === 0 && JSON.stringify(obj) === JSON.stringify({})) ) {
      document.getElementById("infoVizRelations").innerHTML=' <h3>Clicked element information</h3>'
       +'<div id ="buttons-display"></div>'
       +'<div id="textData"> <p> Click on an element of the diagram to display its information </p> </div>';
      var cpt = 0;

      var strResults = '<table id="table" > <tr> ';
      
      for (var u in numberFacetsUnEmpty){
        if ( numberFacetsUnEmpty[u] > 0 ){
          strResults+= '<td align="center">'+ u +'</td>';
        }
      }
      strResults+= '</tr> <tr>';
      for (var u in numberFacetsUnEmpty){
        if ( numberFacetsUnEmpty[u] > 0 ){
          strResults+= '<td>  <div id="infoVizRelations'+cpt+'" height='
          +document.getElementById("infoVizRelations").getBoundingClientRect().height/3
          +' overflow=scroll; overflow-x=visible  > </div>   </td>';
        }
        cpt++;
      }
      strResults += '</tr> </table>';
      document.getElementById("sectionVizResult").innerHTML= strResults;
      document.getElementById("sectionVizResult").style.height="0px";
    } else {
      document.getElementById("infoVizRelations").innerHTML=' <h3>Clicked element information</h3>'
      +'<div id ="buttons-display"></div>'
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

    var fill = d3.scale.category20();
    var widthD3 = $(".container").width();
    var heightD3 = widthD3/2;
    //heightD3+=120;

    var width = document.getElementById("infoVizRelations").getBoundingClientRect().width - 5;
    var height = document.getElementById("infoVizRelations").getBoundingClientRect().height/3;

    var dataBars = [];

    var barCharts=[];
    var cpt = 0;
    for (var u in numberFacetsUnEmpty){
      if (numberFacetsUnEmpty[u] > 0){
        var idToSelect = "#infoVizRelations"+cpt;
        console.log("idToSelect : ");console.log(idToSelect);
        barCharts.push(
          d3.select( idToSelect )
            .insert("svg",":first-child")
            .attr("width", function (){
              // Possibility to modify the value for cpt == 0 if we want a special case for sample and group
              return margin.left+margin.right + (5+10)* (numberFacetsUnEmpty[u]);
            })
            .attr("height", height)
            .attr("id","resultsViz"+cpt+"")
            .attr("class","bar")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("border","solid")
            .style("border-color","#5D8C83")
            .style("border-radius","10px")
        );
      }
      cpt++;
    }

    // Visual part of barChart

    // To modify to use the data of barCharts
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
    console.log("widthRectangles : ");console.log(widthRectangles);
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
        .domain(dataBars[cpt].map(function(d){ console.log("d.content : "+d.content); return d.content;}))
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
    for (var u in results.data.facet_counts.facet_fields ){
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

    for (var h=0; h < dataBars.length; h++){
      for (var i=0; i < dataBars[h].length;i++)
      {
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
              return 'text_'+dataBars[h][i].content;
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
              d3.select('#bar_'+idToSelect).style("fill","green");
            })
            .on("mouseout",function(){
              document.getElementById("elementHelp").visibility="visible";
              document.getElementById("elementHelp").innerHTML = "Help "
              +"<hr/> • Click on a bar or a text to highlight the nodes with these values."
              +"<br/> • Double click to filter the results according to a facet. ";              

              d3.selectAll(".text-d3").style("opacity",1);
              d3.selectAll(".bar").style("fill","steelblue");
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

              document.getElementById("infoPop").innerHTML=" Highlighting nodes according to "+content+" <br/> "+cptHighlighted+" element(s) matching.";
              popOutDiv("infoPop");
              fadeOutDiv("infoPop");

            })
            .on("dblclick",function(d){
              var arrayStuffName=[];var arrayStuffValue=[];
              var indexToCut = this.id.indexOf("_");// arrayStuffName.push("indexToCut");arrayStuffValue.push(indexToCut);
              var idToSelect = this.id.substring(indexToCut+1,this.id.length);// arrayStuffName.push("idToSelect");arrayStuffValue.push(idToSelect);
              var content = d3.select('#bar_'+idToSelect).attr("content");// arrayStuffName.push("content");arrayStuffValue.push(content);
              var occurence = d3.select('#bar_'+idToSelect).attr("occurence");// arrayStuffName.push("occurence");arrayStuffValue.push(occurence);
              var currentFacet = d3.select('#bar_'+idToSelect).attr("facet");// arrayStuffName.push("currentFacet");arrayStuffValue.push(currentFacet);
              var facetsFiltererd = currentFacet.split("_");
              //console.log("facetsFiltererd : ");console.log(facetsFiltererd);
              var indexFacet = currentFacet.indexOf("_"); //arrayStuffName.push("indexFacet");arrayStuffValue.push(indexFacet);
              var currentFacetFiltered = currentFacet.substring(0, indexFacet );// arrayStuffName.push("currentFacetFiltered");arrayStuffValue.push(currentFacetFiltered);
              for (var u in vm.$data.filterQuery){
                // FILTER TO MODIFY !
                var indexFilter = u.indexOf("Filter");
                var uFiltered = u.substring(0,indexFilter);
                for (var v =0; v < facetsFiltererd.length; v++){
                  if ( uFiltered == facetsFiltererd[v] ){
                    console.log("uFiltered == facetsFiltererd[v] == "+facetsFiltererd[v]);
                    if (vm.$data.filterQuery[u] === '' || uFiltered !== currentFacet ){
                      vm.$data.filterQuery[u] = content;
                    } else {
                      vm.$data.filterQuery[u] = '';
                    }
                    vm.$emit("bar-selected");
                    document.getElementById("infoPop").innerHTML=" Filtering the results according to "+content;
                    popOutDiv("infoPop");
                    fadeOutDiv("infoPop");                    
                    vm.$options.methods.querySamples(this,false);
                  }
                }

              }
            })
            .attr("style", "fill:black; writing-mode: tb; glyph-orientation-vertical: 90")
            .text(function(){ return dataBars[h][i].content+' : '+dataBars[h][i].occurence;})
        ;
      }      
    }

    // part to do with barCharts 
    for (var h=0; h < barCharts.length; h++){
      barCharts[h].selectAll(".bar")
        .data(dataBars[h])
        .enter().append("rect")
        .attr("class", "bar")
        .attr("id",function(d){return 'bar_'+d.content;} )
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
        .attr("fill", "steelblue" )
        .on("mouseover",function(d,i){
          console.log("bar chart")
          document.getElementById("elementHelp").style.visibility="visible";
          console.log("facet of bar : ");console.log(d.facet);
          document.getElementById("elementHelp").innerHTML=
            "Help"
            +"<hr/>"+ d.facet +" <hr/> "+d.content
            +", "+d.occurence;

          var idToSelect = '#text_'+d.content;
          d3.selectAll(".text-d3").style("opacity",.5);
          d3.select(idToSelect).style("opacity",1);
          d3.select(this).style("fill","green");
        })
        .on("mouseout",function(d,i){
          document.getElementById("elementHelp").innerHTML = "Help "
          +"<hr/> • Click on a bar or a text to highlight the nodes with these values."
          +"<br/> • Double click to filter the results according to a facet. ";        
          document.getElementById("elementHelp").visibility="visible";

          d3.selectAll(".text-d3").style("opacity",1);
          d3.select(this).style("fill","steelblue");
        })
        .attr("x",function(d){return d.x;})
        .attr("y", function(d){ return height - margin.top - scalesY[h](d.occurence);} )
        .attr("height", function(d) { return Math.max(0,scalesY[h](d.occurence)); })
        .attr("opacity","0.5")
        .on("dblclick",function(d){ 
          console.log("dblclick");
          var content = d.content;
          for (var u in vm.$data.filterQuery){
            console.log(" u : ");console.log(u);
            console.log( "vm.$data.filterQuery[u] : ");console.log( vm.$data.filterQuery[u] );
            console.log("d.facet : ");console.log(d.facet);
            // TO MODIFY !
            var indexFilter = u.indexOf("Filter");
            var uFiltered = u.substring(0,indexFilter);
            var facetsFiltererd = d.facet.split("_");
            for (var v in facetsFiltererd){
              if ( uFiltered === facetsFiltererd[v] ){
                if (vm.$data.filterQuery[u] === '' || uFiltered !== facetsFiltererd[v] ){
                  vm.$data.filterQuery[u] =d.content;
                } else {
                  vm.$data.filterQuery[u] = '';
                }
                vm.$emit("bar-selected");
                console.log(" vm.$data.filterQuery  ");console.log(vm.$data.filterQuery);

                document.getElementById("infoPop").innerHTML=" Filtering the results according to "+content;
                popOutDiv("infoPop");
                fadeOutDiv("infoPop");

                vm.$options.methods.querySamples(this,false);
              }
            }
          }
        })
        .on("mousedown",function(d){
          // Filter the data. We now want to highlight selection instead

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

          document.getElementById("infoPop").innerHTML=" Highlighting nodes according to "+content+" <br/> "+cptHighlighted+" element(s) matching.";
          popOutDiv("infoPop");
          fadeOutDiv("infoPop");

        })
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 40)
          .attr("dy", ".71em")
          //.attr("opacity",1)
          .style("text-anchor", "end")
          .text(function(d){return d.content;})
        ;
    }


    // Nodes relationships here
    var svg;
    if ( document.getElementById("vizSpotRelations") === null ){            
      svg = d3.select(".container").insert("svg",":first-child")
            .attr("width", "60%")
            .attr("height", heightD3)
            .attr("id","vizSpotRelations")
            .style("stroke","green")
            .style("stroke-width", 1)
            .style("border","solid")
            .style("overflow","scroll")
            .style("background-color","#f5f5f5")
            .style("border-color","#5D8C83")
            .style("border-radius","4px")
            .on("mouseenter",function(){
              document.getElementById("elementHelp").style.visibility="visible";
              d3.html("Help <hr/> Hover over a node to make it bigger. <b r/> Click on a node to display its information.");
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
            ) )
            .append("g")
            ;
    } else {
      d3.select("#vizSpotRelations").remove();
      document.getElementById("infoVizRelations").style.visibility="hidden";            
      svg = d3.select(".container").insert("svg",":first-child")
        .attr("width", "60%")
        .attr("height", heightD3)
        .attr("id","vizSpotRelations")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("border","solid")
        .style("overflow","scroll")
        .style("border-color","#5D8C83")
        .style("border-radius","4px")
        .on("mouseenter",function(){
          document.getElementById("elementHelp").style.visibility="visible";
          d3.select("#elementHelp").html("Help <hr/> Hover over a node to make it bigger. <br/> Click on a node to display its information.");
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
    }
    document.getElementById("infoVizRelations").style.visibility="visible";

    var width=document.getElementById("vizSpotRelations").getBoundingClientRect().width;
    var height=document.getElementById("vizSpotRelations").getBoundingClientRect().height;
    document.getElementById("infoVizRelations").style.height=(height)+"px";

    var groupsReturned={};
    var nameToNodeIndex={};
    var nodeData ={ "stuff":[], "nodes":[],"links":[],"group":[],"color":[] };

    var divvizSpotRelations = document.getElementById("vizSpotRelations");
    if (results.data.response.docs.length>0){
      console.log("results.data.response.docs.length>0");
      d3.select("#vizSpotRelations").attr("visibility","visible");

      var resLoad = loadDataFromGET(results, nodeData, vm,server, nameToNodeIndex);
      nodeData=resLoad[0]; groupsReturned=resLoad[1]; nameToNodeIndex=resLoad[2];

      draw(svg,nodeData);

      } else {
        console.log("results.data.response.docs.length==0");
        d3.select("#vizSpotRelations").attr("visibility","hidden");
        d3.select("#vizSpotRelations").selectAll("*").remove();
        document.getElementById("infoVizRelations").style.visibility="hidden";
        document.getElementById("buttonRezInfo").style.visibility="hidden";
        document.getElementById("infoVizRelations").style.height="0px";
        document.getElementById("vizSpotRelations").style.height="0px";
      }

      function draw(svg,nodeData){

        var width=document.getElementById("vizSpotRelations").getBoundingClientRect().width;
        var height=document.getElementById("vizSpotRelations").getBoundingClientRect().height;

        var force = d3.layout.force()
          .gravity(.08)
          .distance(50)
          .charge(-100)
          .size([width, height]);

        var link = svg.selectAll(".link")
        .data(nodeData.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

        //Add circles to the svgContainer
        var node = svg.selectAll("node")
          .data(nodeData.nodes)
          .enter().append("g")
          .attr("class","node")
          .call(force.drag)
        ;

        node.append("circle")
          .attr("r", function (d) { return d.radius * 3; })
          .attr("accession",function(d){return d.accession})
          .attr("class","ghost_circle")
          .attr("id",function(d){ return 'ghost_'+d.accession })
          .attr("sample_grp_accessions",function(d){ return d.sample_grp_accessions})
          .attr("grp_sample_accessions",function(d){ return d.grp_sample_accessions})
          .attr("responseDoc",function(d){return d.responseDoc})
          .attr("type", function (d) { return d.type; })
          .style("fill", function (d) {  return "grey"; })
          .style("stroke","black")
          .style("stroke-width",2)
          .style("stroke-opacity",1)
          .style("opacity", .7)
          .style("visibility", "hidden")
        ;

        node.append("circle")
          .on("mousedown",function(d){
          })
          .on("mouseout",function(d){
          })
          .on("mouseover",function(d){
          })
          .attr("r", function (d) { return d.radius; })
          .attr("accession",function(d){return d.accession})
          .attr("id",function(d){ return 'circle_'+d.accession })
          .attr("sample_grp_accessions",function(d){ return d.sample_grp_accessions})
          .attr("grp_sample_accessions",function(d){ return d.grp_sample_accessions})
          .attr("responseDoc",function(d){return d.responseDoc})
          .attr("type", function (d) { return d.type; })
          .style("fill", function (d) {  return d.color; })
          .style("stroke","black")
          .style("stroke-width",2)
          .style("stroke-opacity",1)
          .style("opacity", .7)
          // Added part for dragging
          //.call(drag)
          //.style("fill", function(d) { return fill(d.group); })
        ;


        node
        .attr("accession",function(d){return d.accession})
        .attr("id",function(d){return 'node_'+d.accession})
        .attr("sample_grp_accessions",function(d){ return d.sample_grp_accessions})
        .attr("grp_sample_accessions",function(d){ return d.grp_sample_accessions})
        .attr("responseDoc",function(d){return d.responseDoc})
        .attr("type", function (d) { return d.type; })
        .style("stroke-width",1)
        .style("fill", function(d) { 
          if (typeof d.group !==  'undefined'){
            if (typeof d.group.color !==  'undefined'){
              return fill(d.group.color); 
            } else {
              return getRandomColor();
            }
          } else {
            return getRandomColor();
          }
        })
        .on("mousedown",function(d){
          console.log('mousedown node d : ');console.log(d);

          d3.selectAll("circle").style("stroke-width",2);
          d3.select(this).selectAll("circle").style("stroke-width", 4);
          //d3.select(this).select("circle").style("border-radius", "6px");
          
          d3.event.stopPropagation();

          document.getElementById("infoVizRelations").className=d.accession;
          // Fill in the infoVizRelations according to data returned
          document.getElementById("textData").innerHTML='<p>';
          var URLs = [];
          for (var prop in d.responseDoc) {
            // skip loop if the property is from prototype
            if(!d.responseDoc.hasOwnProperty(prop)) continue;
            document.getElementById("textData").innerHTML+=""+prop + " = " + d.responseDoc[prop]+"" +"<hr/>";
            URLs = getURLsFromObject(d.responseDoc,prop);
            if (URLs.length>0){
              for (var k=0;k<URLs.length;k++){
                document.getElementById("textData").innerHTML+="<a href=\""+URLs[k]+"\">link text</a>+<br/>";
                document.getElementById("textData").innerHTML+="<img src=\""+URLs[k]+"\" alt=\"google.com\" style=\"height:200px;\" ><br/>"; 
              }
            }
          }
          document.getElementById("textData").innerHTML+='</p>';
          
          var params = { searchTerm:""+d.accession };
          console.log("params : ");console.log(params);
          var rezClick = loadDataWithoutRefresh(vm,server, params);
          console.log("rezClick : "); console.log(rezClick);

        })
        .on("mouseup",function(d){
        })
        .on("mouseout",function(d){
          //document.getElementById("elementHelp").style.visibility="hidden";
          d3.selectAll("text").style("opacity",1);
          //d3.selectAll(".node").selectAll("text").style("font-size", "10px");
          d3.selectAll(".node").selectAll("text").style("dx", 12);
          d3.selectAll(".node").selectAll("text").attr("transform","translate("+ 0 +","+0+")");
          d3.selectAll(".node").selectAll("circle").transition().duration(10).style("r", this.radius);
          d3.select("#elementHelp").html("Help <hr/> Hover over a node to make it bigger. <br/> Click on a node to display its information.");
          //document.getElementById("elementHelp").style.visibility="hidden";
        })
        .on("mouseover",function(d){
          document.getElementById("elementHelp").style.visibility="visible";
          d3.select("#elementHelp").html("Help <hr/> "+d.accession);

          var circleNode = d3.select(this).selectAll("circle");
          var textNode = d3.select(this).select("text");

          d3.selectAll(".node").selectAll("text").style("opacity",.25);
          //d3.selectAll(".node").selectAll("text").style("font-size", "10px");
          textNode.style("opacity",1);
          circleNode.transition().duration(10).style("r", d.radius*3);
          textNode.attr("transform","translate("+ d.radius*1.5 +","+0+")");
          //textNode.transition().duration(10).style("font-size", "20px");
        })
        ;

        node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .attr("id",function(d){return 'text_'+d.accession})
        .text( function (d) { return "["+d.accession+"]"; })
        .attr("font-family", "sans-serif").attr("font-size", "10px")
        .attr("border","solid").attr("border-radius","10px")
        .style("border","solid").style("border-radius","10px")
        .style("box-shadow","gray")
        .style("background-color","green")
        .attr("fill", "#4D504F")
        .on("mouseover",function(d){
          d3.selectAll(".node").selectAll("text").style("font-size", "10px");
        })
        ;


        var hull = svg.append("path")
          .attr("class", "hull");
        
        force
          .nodes(nodeData.nodes)
          .links(nodeData.links)
          .start();

        // Force rules:
        force.on("tick", function() {
          link.attr("x1", function(d) {return d.source.x;})
            .attr("y1", function(d) {return d.source.y; })
            .attr("x2", function(d) {return d.target.x; })
            .attr("y2", function(d) {return d.target.y; })
          ;

          // Check if within node there is a class node dragging
          // if so, translate by 0
          var isDragging = false;
          var accessionDragged = '';
          var elements = svg.selectAll('g');
          for (var i=0; i < elements[0].length; i++){      
            if ( elements[0][i].classList.length > 1 ){
              isDragging = true;
              accessionDragged = elements[0][i].accession;
            }
          }


          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          
        });

        d3.select(self.frameElement).style("height", width - 150 + "px");
      }
  }
}

