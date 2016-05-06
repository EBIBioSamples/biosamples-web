//var Biosample   = require('./components/Biosample.js');

//This is the file to work with for toolsFunctions
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[ 1 + Math.floor(Math.random() * 15)];
  }
  return color;
}

// TODO Incorporation of code from searchComponents
function loadBars(width,height,margin,results,dataBars){

}

function getURLsFromObject(objectToRead,prop){
	var arrayUrls = [];
	var arrayImgTypes = [".jpg",".png",".jpeg",".tiff",".gif"," .jif",".jfif",".jp2",".jpx",".j2k",".j2c",".fpx",".pcd",".pdf"];
	// Loop through the img file formats, and if found, get the url, then add its display in the text area
	for (var i =0; i < arrayImgTypes.length;i++){
	  if (typeof objectToRead[prop] == "string" ){
	    // Loop through different kind of common separators, and turn the string into an array. Then you can use the code previously used to work with an array
	    var strCutSymbols=[];
	    strCutSymbols.push(objectToRead[prop].split(","));
	    strCutSymbols.push(objectToRead[prop].split(";"));
	    strCutSymbols.push(objectToRead[prop].split(" "));
	    var strIsSeveralUrls=false;
	    for (var k=0;k<strCutSymbols.length;k++){
	      if (strCutSymbols[k].length>1){
	        strIsSeveralUrls=true;
	        for (var l=0;l< strCutSymbols[k].length;l++){
	          var indexExtensionImg = strCutSymbols[k][l].indexOf( arrayImgTypes[i] );
	          if ( indexExtensionImg >= 0  ){ 
	            var indexWWW = strCutSymbols[k][l].indexOf( "www" );
	            var indexHttp = strCutSymbols[k][l].indexOf( "http" );
	            var url;
	            if ( indexHttp >= 0 ){
	              url = strCutSymbols[k][l].substr(indexHttp, indexExtensionImg+arrayImgTypes[i].length );
	            } else if ( indexWWW >= 0 ){
	              url = "http://"+strCutSymbols[k][l].substr(indexWWW, indexExtensionImg+arrayImgTypes[i].length );
	            }
	            arrayUrls.push(url);
	          }
	        }
	      }
	    }
	    // Either a single string URL, or an array of URL
	    if ( !strIsSeveralUrls ){
	      var indexExtensionImg = objectToRead[prop].indexOf( arrayImgTypes[i] );
	      if ( indexExtensionImg >= 0  ){ 
	        var indexWWW = objectToRead[prop].indexOf( "www" );
	        var indexHttp = objectToRead[prop].indexOf( "http" );
	        var url;
	        if ( indexHttp >= 0 ){
	          url = objectToRead[prop].substr(indexHttp, indexExtensionImg+arrayImgTypes[i].length );
	        } else if ( indexWWW >= 0 ){
	          url = "http://"+objectToRead[prop].substr(indexWWW, indexExtensionImg+arrayImgTypes[i].length );
	        }
	        arrayUrls.push(url);
	      }
	    } 
	    // URL is given in an array
	  } else if (Array.isArray(objectToRead[prop])){
	    for (var j=0; j < objectToRead[prop].length;j++){                      
	      var indexExtensionImg = objectToRead[prop][j].indexOf( arrayImgTypes[i] );                      
	      if ( indexExtensionImg >= 0  ){ 
	        var indexWWW = objectToRead[prop][j].indexOf( "www" );
	        var indexHttp = objectToRead[prop][j].indexOf( "http" );
	        var url;
	        if ( indexHttp >= 0 ){
	          url = objectToRead[prop][j].substr(indexHttp, indexExtensionImg+arrayImgTypes[i].length );
	        } else if ( indexWWW >= 0 ){
	          url = "http://"+objectToRead[prop][j].substr(indexWWW, indexExtensionImg+arrayImgTypes[i].length );
	        }
	        arrayUrls.push(url);
	      }
	    }
	  }
	}
	return arrayUrls;
}

function loadDataFromGET(results, nodeData, vm,apiUrl, nameToNodeIndex){
	console.log("!!!!! BIG STUFF TO HAPPEN HERE 5 !!!!!");
	console.log("loadDataFromGET in src/main/frontend/js/toolsFunctions");

	if (typeof nameToNodeIndex === "undefined"){ nameToNodeIndex = {}; }
	nodeData.group = [];
	nodeData.color=[];
	nodeData.accessions="";
	var groupsReturned = {};

	for (var i=0;i< results.data.response.docs.length;i++){
		nodeData.accessions+=results.data.response.docs[i].accession+' ';
		//Circle Data Set
		// group
		if (results.data.response.docs[i].content_type=="group"){
			if (typeof results.data.response.docs[i].grp_sample_accessions !== 'undefined'){
			  nodeData.nodes.push({
			  	"radius": 10,
			  	"color" : getRandomColor(),
			  	"type":"group",
			  	"name":results.data.response.docs[i].accession,
			  	"accession":results.data.response.docs[i].accession,
			    "Group_Name_crt": results.data.response.docs[i].Group_Name_crt, 
			    "Derived_From_crt": results.data.response.docs[i].Derived_From_crt,"Same_As_crt": results.data.response.docs[i].Same_As_crt,"Child_Of_crt": results.data.response.docs[i].Child_Of_crt,
			    "grp_sample_accessions":results.data.response.docs[i].grp_sample_accessions,
			    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i],
			  });
			  groupsReturned[results.data.response.docs[i].Group_Name_crt]=results.data.response.docs[i].grp_sample_accessions;
			} else {
			  nodeData.nodes.push({
			  	"radius": 10, 
			  	"color" : getRandomColor(), 
			  	"type":"group", 
			  	"name":results.data.response.docs[i].accession,
			  	"accession":results.data.response.docs[i].accession,
			    "Group_Name_crt": results.data.response.docs[i].Group_Name_crt, 
			    "Derived_From_crt": results.data.response.docs[i].Derived_From_crt,"Same_As_crt": results.data.response.docs[i].Same_As_crt,"Child_Of_crt": results.data.response.docs[i].Child_Of_crt,
			    "grp_sample_accessions":[],
			    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i],
			  });
			  groupsReturned[results.data.response.docs[i].Group_Name_crt]=[];
			}
			nameToNodeIndex[ results.data.response.docs[i].accession ] = nodeData.nodes.length-1;
		} //sample
		else {
			if (typeof results.data.response.docs[i].sample_grp_accessions !== 'undefined'){
			  nodeData.nodes.push({ 	
			  	"radius": 5, 
			  	"color" : getRandomColor(), 
			  	"type":"sample", 
			  	"name":results.data.response.docs[i].accession,
			  	"accession":results.data.response.docs[i].accession,
			    "sample_grp_accessions":results.data.response.docs[i].sample_grp_accessions,
			    "Derived_From_crt": results.data.response.docs[i].Derived_From_crt,"Same_As_crt": results.data.response.docs[i].Same_As_crt,"Child_Of_crt": results.data.response.docs[i].Child_Of_crt,
			    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i],
			  });

			  if ( typeof groupsReturned[results.data.response.docs[i].sample_grp_accessions[0]] === 'undefined' ){
			  	groupsReturned[results.data.response.docs[i].sample_grp_accessions[0]]=[];
			  }
			  groupsReturned[results.data.response.docs[i].sample_grp_accessions[0]].push(results.data.response.docs[i].accession);
			} else {
			  nodeData.nodes.push({
			  	"radius": 5,
			  	"color" : getRandomColor(),
			  	"type":"sample",
			  	"accession":results.data.response.docs[i].accession,
			  	"name":results.data.response.docs[i].accession,
			    "sample_grp_accessions":[],
			    "Derived_From_crt": results.data.response.docs[i].Derived_From_crt,"Same_As_crt": results.data.response.docs[i].Same_As_crt,"Child_Of_crt": results.data.response.docs[i].Child_Of_crt,
			    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i],
			  });
			}
		}
		nameToNodeIndex[results.data.response.docs[i].accession] = nodeData.nodes.length-1;
	}

	var accessionToIndex={};
	// Step 1: save from group to sample in nodes
	for (var i=0; i < nodeData.nodes.length;i++){
		//nodeData.nodes.push({"name":nodeData.stuff[i].accession[0]});
		accessionToIndex[nodeData.nodes[i].accession] = i;
		nodeData.group[i]='';
		nodeData.color[i]='';
	}
	// Step 2: for every element in the group to sample, create a link (do it just once)
	var indexCalculation=0;
	for (var group in groupsReturned){
		// TODO: GET request to get the information in global about the samples within the group
		colorGroup = getRandomColor();
		if ( nodeData.accessions.indexOf( group ) === -1 ){
			indexCalculation++;
			nodeData.nodes.push({
				"radius": 10,
				"type":"groupViz",
				"name":group,
				"accession":group,
				"sample_grp_accessions":undefined,
				"grp_sample_accessions":groupsReturned[group],
			    "Derived_From_crt": undefined,"Same_As_crt": undefined,"Child_Of_crt": undefined,
			    "id": undefined,"responseDoc":undefined,
			    "color":colorGroup
			});
			nodeData.group.push(group);
			nodeData.color.push(colorGroup);
			nameToNodeIndex[group]=nodeData.nodes.length-1;
		} // The node for the group already has been returned else 1
		else {
			var indexNodeGroup = nameToNodeIndex[group];
			nodeData.color[ indexNodeGroup ] = colorGroup;
			nodeData.nodes[ indexNodeGroup ].color = colorGroup;
	
			// => change this into a hash map
			// .groupAttributesToValues [attribute] => [ [value,samples with this value] ]
			// .groupValuesToSamples [attribute value] => samples with this value
			nodeData.nodes[ nameToNodeIndex[group] ].groupAttributesToValues = {};
			nodeData.nodes[ nameToNodeIndex[group] ].groupValuesToSamples = {};

			for (var i=0; i < groupsReturned[group].length; i ++){
				for (var attr in nodeData.nodes[nameToNodeIndex[group]].responseDoc){

					var attrSample = attr;
					var valueSample = nodeData.nodes[nameToNodeIndex[group]].responseDoc[attr];

					( typeof nodeData.nodes[nameToNodeIndex[group]].groupValuesToSamples[valueSample] === "undefined" ) ?
					nodeData.nodes[nameToNodeIndex[group]].groupValuesToSamples[valueSample] = [ groupsReturned[group][i] ] 
					: nodeData.nodes[nameToNodeIndex[group]].groupValuesToSamples[valueSample].push(groupsReturned[group][i]);

					nodeData.nodes[nameToNodeIndex[group]].groupAttributesToValues[attrSample] = [ valueSample, nodeData.nodes[nameToNodeIndex[group]].groupValuesToSamples[valueSample]  ] 
				}
			}

		}

		// Probably here that we should decide what to get in the new get request
		
		for (var i=0; i < groupsReturned[group].length;i++){
			nodeData.group[ nameToNodeIndex[ groupsReturned[group][i]] ] = group;

			if (typeof nameToNodeIndex[ groupsReturned[group][i] ] !== 'undefined'){
				//console.log( nameToNodeIndex[ groupsReturned[group][i]] );
				//console.log(nodeData.nodes[ nameToNodeIndex[ groupsReturned[group][i]] ]);
				//console.log(nodeData.color[ nameToNodeIndex[ groupsReturned[group][i]] ]);
				nodeData.color[ nameToNodeIndex[ groupsReturned[group][i]] ] = colorGroup;
				nodeData.nodes[ nameToNodeIndex[ groupsReturned[group][i]] ].color = colorGroup;

				nodeData.links.push({
					"source": nameToNodeIndex[ groupsReturned[group][i] ],
					"target": nameToNodeIndex[ group ],
					"weight": Math.sqrt(groupsReturned[group].length)
				})
			}
		}
	}

	console.log("nodeData : ");console.log(nodeData);
	console.log("===========================");
	return [nodeData,groupsReturned,nameToNodeIndex];
}

function getSamplesFromGroup(apiUrl,group){

}

function loadDataWithoutRefresh(vm,apiUrl,parameters){	
  var queryParams = vm.getQueryParameters();
  queryParams.searchTerm = parameters.searchTerm;
  console.log("************");
  console.log("loadDataWithoutRefresh : ");
  console.log("vm : ");console.log(vm);
  console.log("apiUrl : ");console.log(apiUrl);
  console.log("queryParams : ");console.log(queryParams);
  console.log("************");

  //var rezToReturn = vm.$http.get(server,queryParams)
  var rezToReturn = vm.$http.get(apiUrl,queryParams)
    .then(function(results){

	  vm.currentQueryParams = queryParams;  

	  var resultsInfo = results.data.response;
	  var highLights = results.data.highlighting;
	  var types = results.data.facet_counts.facet_fields.content_type;
	  var organisms = results.data.facet_counts.facet_fields.organism_crt;
	  var organs = results.data.facet_counts.facet_fields.organ_crt;
	  var docs = resultsInfo.docs;
	  var hlDocs = vm.associateHighlights(docs, highLights);
	  
	  return results;

	})
	.catch(function(data,status,response){
	  console.log("data : ");console.log(data);
	  console.log("status : ");console.log(status);
	  console.log("response : ");console.log(response);
	});
	console.log("outside the get of loadDataWithoutRefresh");
	console.log("rezToReturn : ");console.log(rezToReturn);
	return rezToReturn;
}

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

function popOutDiv(stringDiv){
	var stringID = '#'+stringDiv;
	//clearTimeout(stringID);
	var timeOutHandle = setTimeout(function() {
	  $(stringID).fadeIn('fast');
	}, 5); // <-- time in milliseconds
}

function fadeOutDiv(stringDiv){
	
	var stringID = '#'+stringDiv;
	//clearTimeout(stringID);
	setTimeout(function() {
	  $(stringID).fadeOut('slow');
	}, 3500); // <-- time in milliseconds	
}


function changeSpecialCharacters( myid ) { 
    return myid.replace( /(:|\'|\"|\.|\-|\{|\}|\/|\%| |\.|\,|\;|\(|\)|\[|\]|,)/g, "_" );
}


function draw(svg,nodeData){

	console.log("draw");

	var width = Math.floor((70 * window.innerWidth)/100);
	//var width = window.innerWidth;
	var height=heightD3;

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

	  	d3.event.stopPropagation();          

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

	  // var params = { searchTerm:""+d.accession };
	  // console.log("params : ");console.log(params);
	  // var rezClick = loadDataWithoutRefresh(vm,apiUrl, params);
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
	.style("background-color","#46b4af")
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
