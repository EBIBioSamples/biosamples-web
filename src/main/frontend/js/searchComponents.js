/**
 * The `SearchComponent` class is the main class for the search interface containing all
 * the javascript logic to interact with the interface
 * @class SearchComponent
 * @requires underscore, vue, vue-resource, Biosamples
 * @uses Window
 */
(function(window){
    "use strict";

    window.apiUrl = "http://localhost:8080/search_api/";

    // Required
    var _           = require("lodash");
    var _mixins     = require('./utilities/_mixins.js');
    var Vue         = require('vue');
    var VueResource = require('vue-resource');
    var Biosample   = require('./components/Biosample.js');


    // Vue Configuration
    Vue.config.debug = false;
    Vue.config.silent = true;

    // Plugins
    Vue.use(VueResource);

    // Filters & Components
    Vue.filter('excerpt',require('./filters/excerptFilter.js'));
    Vue.component('badge', require('./components/badge/Badge.js'));

    /**
     * Read Solr facets and return them as a key-value pair object
     * @method readFacets
     * @param  facets {SolR Facets} Facets returned by Solr
     * @return {Object} A key-value object representing the facets names and the count
     */
    function readFacets(facets) {
      console.log("--+ readFacets");
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
            pageNumber: 0,
            samplesToRetrieve: 10,
            resultsNumber: '',
            queryResults: {},
            biosamples: [],
            filterQuery: {
                typeFilter: '',
                organismFilter: '',
                organFilter: ''
            },
            facets: {
                types: {},
                organisms: {},
                organs: {},
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
            console.log("--+ ready");
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
                if (e !== undefined) {
                    e.preventDefault();
                }
                if (_.isEmpty(this.searchTerm)) {
                    return;
                }
                var queryParams = this.getQueryParameters();
                var server = apiUrl + "query";

                this.$http.get(server,queryParams)
                    .then(function(results){

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

                doD3Stuff(results,vm);
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
                    'start': this.pageNumber,
                    'useFuzzySearch': this.useFuzzy,
                    'organFilter': this.filterQuery.organFilter,
                    'typeFilter': this.filterQuery.typeFilter,
                    'organismFilter': this.filterQuery.organismFilter
                };              
            },

            populateDataWithUrlParameter: function(urlParams) {
              this.searchTerm = urlParams.searchTerm;
              this.samplesToRetrieve = _.toInteger(urlParams.rows);
              this.pageNumber= _.toInteger(urlParams.start);
              this.useFuzzy = urlParams.useFuzzySearch === "true" ? true : false;
              this.filterQuery.organFilter = urlParams.organFilter;
              this.filterQuery.typeFilter = urlParams.typeFilter;
              this.filterQuery.organismFilter = urlParams.organismFilter;
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

                this.$on('bar-selected', function(d) {
                  console.log("you clicked on a bar");
                  this.querySamples();
                })

                this.$on('facet-selected', function(key, value) {
                    if (value === "") {
                        console.log("Removed filter: [" + key + "]");
                        Vue.delete(this.filterQuery,key);
                    } else {
                        console.log("this Set filter: [" + key + "]=" + value);
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


function doD3Stuff( results, vm=0 ){
  console.log("_______doD3Stuff______");
  //console.log("---- vm : ");console.log(vm);
  //console.log("---- vm.$data");console.log(vm.$data);
  
  if (typeof results !== 'undefined'){
    document.getElementById("infoVizRelations").innerHTML=
    '<h3>Result information</h3>  <div id=\"infoVizRelations1\" height='
    +document.getElementById("infoVizRelations").getBoundingClientRect().height/3
    +' ></div><div id=\"infoVizRelations2\" height='
    +document.getElementById("infoVizRelations").getBoundingClientRect().height/3
    +'></div> <h3>Clicked element information</h3> <div id=\"textData\">  </div>'

    console.log("======================");
    console.log("this : ");console.log(this);
    console.log("results : ");console.log(results);
    /*
    console.log("resultsInfo : ");console.log(resultsInfo);
    console.log("types : ");console.log(types);
    console.log("organisms : ");console.log(organisms);
    console.log("docs : ");console.log(docs);
    console.log("hlDocs : ");console.log(hlDocs);
    console.log("this.queryTerm : ");console.log(this.queryTerm);
    console.log("this.facets.types : ");console.log(this.facets.types);
    console.log("this.facets.organisms : ");console.log(this.facets.organisms);
    console.log("this.facets.organs : ");console.log(this.facets.organs);
    console.log("this.facets : ");console.log(this.facets);
    */

    //console.log("this.queryTerm : ");console.log(this.queryTerm);
    //console.log("this.queryResults : ");console.log(this.queryResults);           
    var fill = d3.scale.category20();

    var widthD3 = $(".container").width();

    var heightD3 = widthD3/2;
    heightD3+=120;

    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = document.getElementById("infoVizRelations").getBoundingClientRect().width - 5;
    var height = document.getElementById("infoVizRelations").getBoundingClientRect().height/3;

    // Vars used to load data and viz for bar charts
    // width, height, margin, results, dataBar1,dataBar2,dataBars
    // and d3. It is possible it complains
    // Soon to also interact with vm

    var dataBar1 = [];
    var dataBar2 = [];
    var dataBars = [];

    // Visual part of barChart
    var barChart1 = d3.select("#infoVizRelations1")
      .insert("svg",":first-child")
      .attr("width", width)
      .attr("height", height)
      //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("id","resultsViz1")
      .attr("class","bar")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("border","solid")
      .style("border-color","#5D8C83")
      .style("border-radius","10px")
    ;
    var barChart2 = d3.select("#infoVizRelations2")
      .insert("svg",":first-child")
      //.attr("width", width)
      .attr("width", function (){
        return margin.left+margin.right + (5+10)* (results.data.facet_counts.facet_fields.organ_crt.length/2);
      })
      .attr("height", height)
      //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("id","resultsViz2")
      .attr("class","bar")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("border","solid")
      .style("border-color","#5D8C83")
      .style("border-radius","10px")
    ;

    //var x = d3.scale.ordinal().rangeRoundBands([0, document.getElementById("infoVizRelations1").getBoundingClientRect().width], .1);
    //var y = d3.scale.linear().range([0, height]);
    var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

    var y = d3.scale.linear()
      .domain([0, height])
      .range([height, 0]);

    //var dataBars = loadBarCharts();

    var widthRectangle1 = (width - 5)/( Math.floor(results.data.facet_counts.facet_fields.content_type.length/2) ) - margin.left - margin.right;
    // TODO: change the svg for this bar chart area to be bigger than the html div
    //var widthRectangle2 = (width - 5)/( Math.floor(results.data.facet_counts.facet_fields.organ_crt.length/2) ) -margin.right ;
    var widthRectangle2 = 10;

    var maxOccurence1 = 0;
    for (var i=0; i < results.data.facet_counts.facet_fields.content_type.length;i++){
      if (typeof results.data.facet_counts.facet_fields.content_type[i] !== "string" ){
        if (maxOccurence1 < results.data.facet_counts.facet_fields.content_type[i])
          maxOccurence1 = results.data.facet_counts.facet_fields.content_type[i];
      }
    }
    var maxOccurence2 = 0;
    for (var i=0; i < results.data.facet_counts.facet_fields.organ_crt.length;i++){
      if (typeof results.data.facet_counts.facet_fields.organ_crt[i] !== "string" ){
        if (maxOccurence2 < results.data.facet_counts.facet_fields.organ_crt[i])
          maxOccurence2 = results.data.facet_counts.facet_fields.organ_crt[i];
      }
    }          
    
    var scale1x = d3.scale.ordinal()
      // domain is input data, range is output to put the data to
      .domain(dataBar1.map(function(d){ return d.content;}))
      .range([15, width - 30])
    ;
    var scale1y = d3.scale.linear().domain([0, maxOccurence1 ]).range([1, height - 40 ]);

    var scale2x = d3.scale.ordinal()
      // domain is input data, range is output to put the data to
      .domain(dataBar2.map(function(d){ return d.content;}))
      .range([margin.left, width - margin.right])
    ;
    var scale2y = d3.scale.linear().domain([0, maxOccurence2 ]).range([1, height - 40 ]);

    for (var u=0; u < results.data.facet_counts.facet_fields.content_type.length;u++){
      (u%2 === 0) ? 
      dataBar1.push({"content":results.data.facet_counts.facet_fields.content_type[u], "occurence":0 , "x":Math.floor(u/2) * (widthRectangle1 + 5) +margin.left,"index":Math.floor(u/2) }) 
      : dataBar1[Math.floor(u/2)].occurence=results.data.facet_counts.facet_fields.content_type[u]
    }
    for (var u=0; u < results.data.facet_counts.facet_fields.organ_crt.length;u++){
      (u%2 === 0) ? 
      dataBar2.push({"content":results.data.facet_counts.facet_fields.organ_crt[u], "occurence":0 , "x":Math.floor(u/2) * (widthRectangle2 + 5) +margin.left,"index":Math.floor(u/2) }) 
      : dataBar2[Math.floor(u/2)].occurence=results.data.facet_counts.facet_fields.organ_crt[u]
    }
    //x.domain(barChart1.map(function(d) { return d.content; }));
    //y.domain([0, d3.max(barChart1, function(d) { return d.occurence; })]);          
    
    var xAxis1 = d3.svg.axis()
      .scale(scale1x)
      .orient("bottom")
    ;
    var yAxis = d3.svg.axis()
      .scale(scale1y)
      .orient("left");
    ;
    var xAxis2 = d3.svg.axis()
      .scale(scale2x)
      .orient("bottom")
    ;
    var yAxis2 = d3.svg.axis()
      .scale(scale2y)
      .orient("left");
    ;

    // Second attributes of research displayed
    for (var i=0; i < dataBar1.length;i++)
    {
      var xHere=i*(widthRectangle1+5)+margin.left;
      var yHere=height - margin.bottom;
      d3.select("#resultsViz1")
        .append("text")
          .attr("class","text-d3")
          .attr("x",function(){ return xHere + widthRectangle1/2 ;})                
          .attr("y", function(){ return 0; })
          .attr("dy", ".71em")
          .attr("opacity","1")
          .attr("style", "fill:black; writing-mode: tb; glyph-orientation-vertical: 90")
          .text(function(){ return dataBar1[i].content+' : '+dataBar1[i].occurence;})
          //.attr("transform", "translate(-"+  +","+ height/2 +") rotate(-90)");
      ;
    }
    barChart1.selectAll(".bar")
        .data(dataBar1)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("id",function(d){return d.content;} )
        // space is 5
        .attr("width", widthRectangle1 )
        .attr("x",function(d){return d.x;})
        .attr("y", function(d){ return height - margin.top - scale1y(d.occurence);} )
        .attr("height", function(d) { return scale1y(d.occurence); })
        .attr("opacity","0.5")
        .on("mousedown",function(d){
          console.log("You clicked on a rectangle and d is : ");console.log(d);
          console.log("vm still here ?");console.log(vm);
          console.log("d : ");console.log(d);
          if (vm.$data.filterQuery.typeFilter === '' || vm.$data.filterQuery.typeFilter!== d.content ){
            vm.$data.filterQuery.typeFilter=d.content;
          } else {
            vm.$data.filterQuery.typeFilter = '';
          }
          vm.$emit("bar-selected");

          console.log("//////");
          //vm.$options.methods.querySamples();
        })
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 40)
          .attr("dy", ".71em")
          .attr("opacity",1)
          .style("text-anchor", "end")
          .text(function(d){return d.content;})
        ;

    // Second attributes of research displayed
    for (var i=0; i < dataBar2.length;i++)
    {
      var xHere=i*(widthRectangle2+5)+margin.left;
      var yHere=height - margin.bottom;
      d3.select("#resultsViz2")
        .append("text")
          .attr("x",function(){ return xHere + widthRectangle2/2 ;})
          .attr("y", function(){ return 0; })
          .attr("dy", ".71em")
          .attr("opacity","1")
          .attr("style", "fill:black; writing-mode: tb; glyph-orientation-vertical: 90")
          .text(function(){ return dataBar2[i].content+' : '+dataBar2[i].occurence;})
          //.attr("transform", "translate(-"+  +","+ height/2 +") rotate(-90)");
      ;
    }
    barChart2.selectAll(".bar")
        .data(dataBar2)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("id",function(d){return d.content;} )
        // space is 5
        .attr("width", widthRectangle2 )
        .attr("x",function(d){return d.x;})
        .attr("y", function(d){ return height - margin.top - scale2y(d.occurence);} )
        .attr("height", function(d) { return scale2y(d.occurence); })
        .attr("opacity","0.5")
        .on("mousedown",function(d){
          if (vm.$data.filterQuery.organFilter === '' || vm.$data.filterQuery.organFilter !== d.content){
            vm.$data.filterQuery.organFilter=d.content;
          } else {
            vm.$data.filterQuery.organFilter='';
          }
          vm.$emit("bar-selected");
        })
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 40)
          .attr("dy", ".71em")
          .attr("opacity",1)
          .style("text-anchor", "end")
          .text(function(d){return d.content;})
        ;

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
            .style("border-color","#5D8C83")
            .style("border-radius","10px")
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
        .style("border-radius","10px")
        .call(d3.behavior.zoom().on("zoom", (function (d) {
            //console.log("onzoom d : ");console.log(d);
            //console.log("onzoom d3 : ");console.log(d3);
            //console.log("svg : ");console.log(svg);
            //console.log("this : ");console.log(this);
            svg.attr("transform", 
              // TODO ? ADD STUFF TO CHECK IF CLASS IS DRAGGABLE !
              "translate(" + d3.event.translate + ")" + 
              " scale(" + d3.event.scale + ")"
              );
          })
        ) )
        .append("g")
        ;
    }
    document.getElementById("infoVizRelations").style.visibility="visible";

    var width=document.getElementById("vizSpotRelations").getBoundingClientRect().width;
    var height=document.getElementById("vizSpotRelations").getBoundingClientRect().height;
    document.getElementById("infoVizRelations").style.height=(height-4)+"px";

    var groupsReturned={};
    var nameToNodeIndex={};
    var nodeData ={ "stuff":[], "nodes":[],"links":[],"group":[],"color":[] };

    var divvizSpotRelations = document.getElementById("vizSpotRelations");
    if (results.data.response.docs.length>0){
      console.log("results.data.response.docs.length>0");
      d3.select("#vizSpotRelations").attr("visibility","visible");

      var resLoad = loadDataFromGET(results, nodeData,groupsReturned,nameToNodeIndex);
      nodeData=resLoad[0]; groupsReturned=resLoad[1]; nameToNodeIndex=resLoad[2];

      draw(svg,nodeData);

      } else {
        console.log("results.data.response.docs.length==0");
        d3.select("#vizSpotRelations").attr("visibility","hidden");
        d3.select("#vizSpotRelations").selectAll("*").remove();
        document.getElementById("infoVizRelations").style.visibility="hidden";
      }

      function draw(svg,nodeData){

        var width=document.getElementById("vizSpotRelations").getBoundingClientRect().width;
        var height=document.getElementById("vizSpotRelations").getBoundingClientRect().height;

        var force = d3.layout.force()
          .gravity(.05)
          .distance(80)
          .charge(-300)
          .friction(0.5)
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
          .on("mousedown",function(d){
            console.log("inside circle mousedown this : ");console.log(this);
            //console.log("on mousedown circle d : ");console.log(d);
            d3.selectAll("circle").style("stroke-width",1);
            d3.select(this).style("stroke-width", 5);
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
          })
          .on("mouseout",function(d){

          })
          .on("mouseover",function(d){
            //console.log("on mouseover circle ");
            //d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
          })
          // Added attributes
          //.attr("cx", function (d) { return d.cx; }) .attr("cy", function (d) { return d.cy; })
          .attr("r", function (d) { return d.radius; })
          .attr("accession",function(d){return d.accession})
          .attr("sample_grp_accessions",function(d){ return d.sample_grp_accessions})
          .attr("grp_sample_accessions",function(d){ return d.grp_sample_accessions})
          .attr("responseDoc",function(d){return d.responseDoc})
          //.attr("id", function (d) { return d.id; })
          .attr("type", function (d) { return d.type; })
          .style("fill", function (d) {  return d.color; })
          .style("opacity", .8)
          // Added part for dragging
          //.call(drag)
          //.style("fill", function(d) { return fill(d.group); })
        ;


        node
        .attr("accession",function(d){return d.accession})
        .attr("sample_grp_accessions",function(d){ return d.sample_grp_accessions})
        .attr("grp_sample_accessions",function(d){ return d.grp_sample_accessions})
        .attr("responseDoc",function(d){return d.responseDoc})
        //.attr("id", function (d) { return d.id; })
        .attr("type", function (d) { return d.type; })
        //.style("fill", function (d) { return d.color; })
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
        })
        .on("mouseup",function(d){

        })
        .on("mouseover",function(d){
          console.log("on mouseover node");
          // Math wrong and need to check if draggable
          //d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
        })
        ;

        node.append("text")
        //.attr("x", function(d) { return d.cx + d.radius; }).attr("y", function(d) { return d.cy; })
        .attr("dx", 12)
        .attr("dy", ".35em")
        //.text( function (d) { return "[" + d.accession+"]"+"["+d.sample_grp_accessions+"]"; })
        .text( function (d) { return "["+d.accession+"]"; })
        .attr("font-family", "sans-serif").attr("font-size", "10px")
        .attr("border","solid").attr("border-radius","10px")
        .style("border","solid").style("border-radius","10px")
        .style("box-shadow","gray")
        .style("background-color","green")
        .attr("fill", "#4D504F")
        .on("mouseover",function(d){ 
          d3.selectAll(".node").selectAll("text").style("opacity",.25);
          d3.select(this).style("opacity",1);
          //d3.select(this).style("font-weight","bold");
        })
        .on("mouseout",function(d){ 
          //console.log("mouseout");
          //d3.selectAll("text").style("visibility","visible");
          d3.selectAll("text").style("opacity",1);
          //d3.select(this).style("font-weight","bold");    
        })
        .on("mousedown", function(d){
          //d3.selectAll("text").style("font-weight","normal");
          //d3.select(this).style("font-weight","bold");
          svg.attr("transform", 
            " scale(" + d3.event.scale + ")"
            );    
        })
        .on("mouseup",function(d){

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
          //text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          
        });

        d3.select(self.frameElement).style("height", width - 150 + "px");
      }
  }
}