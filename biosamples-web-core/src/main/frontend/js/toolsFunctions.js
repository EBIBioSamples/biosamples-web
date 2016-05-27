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
	console.log("!!!!!loadDataFromGET !!!!!");
	console.log("results.data.response.docs : ");console.log( results.data.response.docs );
	// for (var i in results.data.response.docs){
	// 	// console.log("results.data.response.docs[i] : ");console.log(results.data.response.docs[i]);
	// 	for (var j in results.data.response.docs[i]){
	// 		console.log("j : ");console.log(j);
	// 		console.log("results.data.response.docs[i][j] : ");console.log(results.data.response.docs[i][j]);
	// 	}
	// }
	console.log('d3.select("#vizSpotRelations") : ');
	console.log(d3.select("#vizSpotRelations"));
	// console.log("force : ");
	// console.log(force);
	console.log("!!!!!!");

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
				nodeData.color[ nameToNodeIndex[ groupsReturned[group][i]] ] = colorGroup;
				nodeData.nodes[ nameToNodeIndex[ groupsReturned[group][i]] ].color = colorGroup;
				console.log("**** nodeData.nodes ****");
				console.log("[ nameToNodeIndex[ groupsReturned[group][i]] ] : ");
				console.log(nodeData.nodes[ nameToNodeIndex[ groupsReturned[group][i]] ]);
				console.log("****");
				nodeData.links.push({
					"id":"link_"+nodeData.nodes[ nameToNodeIndex[ groupsReturned[group][i]] ].accession+"_"+nodeData.nodes[ nameToNodeIndex[ group] ].accession,
					"source": nameToNodeIndex[ groupsReturned[group][i] ],
					"target": nameToNodeIndex[ group ],
					"nodeSource": nodeData.nodes[ nameToNodeIndex[ groupsReturned[group][i]] ],
					"nodeTarget": nodeData.nodes[ nameToNodeIndex[ group] ] ,
					"weight": Math.sqrt(groupsReturned[group].length)
				})
			}
		}
	}

	console.log("groupsReturned : ");console.log(groupsReturned);
	console.log("nodeData : ");console.log(nodeData);
	console.log("===========================");
	return [nodeData,groupsReturned,nameToNodeIndex];
}

function getSamplesFromGroup(apiUrl,group){

}

function loadDataWithoutRefresh(vm,apiUrl,parameters){	
  var queryParams = vm.getQueryParameters();
  queryParams.searchTerm = parameters.searchTerm;

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
    return myid.replace( /(:|\!|\?|\'|\"|\.|\-|\{|\}|\/|\%| |\.|\,|\;|\(|\)|\[|\]|,)/g, "_" );
}

function showTextSamples(boolValue) {
	if ( boolValue.checked ){
		d3.selectAll(".node").selectAll("text").style("visibility","visible");
	} else {
		d3.selectAll(".node").selectAll("text").style("visibility",function(d){
			if (d.type == "group" || d.type == "groupViz"){
				return "visible";
			} else {
				return "hidden";
			}
		});
	}
}

function saveURL(e){
	d3.select("#saveButton")[0][0].textContent=document.URL;
	d3.select("#saveButton").style("overflow-x ","visible");
}

function linkPerAttributes(e){
	console.log("linkPerAttributes");
	// console.log("d3.select(e)[0][0] : ");console.log(d3.select(e)[0][0]);
	// console.log("d3.select(e)[0][0].attributes : ");console.log(d3.select(e)[0][0].attributes);
	// console.log('(d3.selectAll(".node") : ');console.log(d3.selectAll(".node"));
	var d3Node = d3.select("#vizSpotRelations");
	var attributeClicked = d3.select(e)[0][0].attributes.id.value.replace(/[^A-Za-z0-9]/g,"") , valueClicked = d3.select(e)[0][0].attributes.value.value.replace(/[^A-Za-z0-9]/g,"");
	console.log("----");
	console.log("attributeClicked : ");console.log(attributeClicked);
	console.log("valueClicked : ");console.log(valueClicked);
	console.log("----");



	var force = d3.layout.force();
	var node = d3Node.selectAll(".node"),
		link = d3Node.selectAll(".link"),
		responseDocs = d3Node.selectAll(".node").select("responseDoc");


	// console.log("node : ");console.log(node);
	// console.log("node[0][0].attributes : ");console.log( node[0][0].attributes );
	// console.log("node[0][0].attributes.responseDoc : ");console.log( node[0][0].attributes.responseDoc );
	// console.log("link : ");console.log(link);
	// console.log("responseDocs : ");console.log(responseDocs);

	// for ( var i in node[0]){
	// 	// console.log("node[0][i].attributes : ");console.log(node[0][i].attributes);
	// 	for (var j in node[0][i].attributes){
	// 		console.log("----");
	// 		// console.log('node[0][i].attributes[j]');console.log( node[0][i].attributes[j]);
	// 		// console.log('node[0][i].attributes[j]+""');console.log(node[0][i].attributes[j]+"");
	// 		for ( var k in node[0][i].attributes[j]){
	// 			console.log("k : ");console.log( k );
	// 			console.log("node[0][i].attributes[j][k] : ");console.log(node[0][i].attributes[j][k]);
	// 		}
	// 		console.log("----");
	// 	}
	// }
}

function draw(svg,nodeData){

	document.getElementById("buttons-display").style.display="block";

	var widthTitle = window.innerWidth;
	var width = Math.floor((70 * window.innerWidth)/100);
	var heightD3 = widthTitle/2;
	var height=heightD3;

	var force = d3.layout.force()
	.gravity(.08)
	.distance(40)
	.charge(-90)
	.size([width, height]);

	var link = svg.selectAll(".link")
	.data(nodeData.links)
	.enter().append("line")
	.attr("class", "link")
	.attr("id",function(d){return d.id;})
	.attr("source",function(d){return d.source;})
	.attr("target",function(d){return d.target;})
	.attr("nodeSource",function(d){ return d.nodeSource; })
	.attr("nodeTarget",function(d){ return d.nodeTarget; })
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
	.attr("type", function (d) { return d.type; })
	.style("fill", function (d) {  return "grey"; })
	.style("stroke","black") .style("stroke-width",2)
	.style("stroke-opacity",1) .style("opacity", .7)
	.style("visibility", "hidden")
	;

	node.append("circle")
	.attr("r", function (d) { return d.radius; })
	.attr("accession",function(d){return d.accession})
	.attr("id",function(d){ return 'circle_'+d.accession })
	.attr("sample_grp_accessions",function(d){ return d.sample_grp_accessions})
	.attr("grp_sample_accessions",function(d){ return d.grp_sample_accessions})
	.attr("responseDoc",function(d){return d.responseDoc})
	.attr("type", function (d) { return d.type; })
	.style("fill", function (d) {  return d.color; })
	.style("stroke","black") .style("stroke-width",2)
	.style("stroke-opacity",1) .style("opacity", .7)
	;

  	node
	  .attr("accession",function(d){return d.accession})
	  .attr("id",function(d){return d.accession})
	  .attr("isThereSelected",function(d){ return 'false';})
	  .attr("theOneSelected",function(d){return 'false'})
	  .attr("responseDoc",function(d){ 
	  	for ( var i in d.responseDoc){
			// Need to remove special characters to put them in a dom apparently
	  		var attr = i+'' ; attr = attr.replace(/[^A-Za-z0-9]/g,"");
	  		var value = d.responseDoc[i]+''; value = value.replace(/[^A-Za-z0-9]/g,"");
	  		d3.select(this).attr( attr , value );
	  	}
	  	// console.log("d3.select(this)[0][0].attributes : ");console.log(d3.select(this)[0][0].attributes);
	  	return d.responseDoc
	  })
	  .attr("name",function(d){return d.accession})
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
		d3.selectAll(".node").attr("isThereSelected",'true');
		d3.select("this").attr("theOneSelected",'true');

		console.log('d3.select("#vizSpotRelations") : ');console.log( d3.select("#vizSpotRelations") );
		console.log("witdh: "+width+" height: "+height);
		// var force = d3.layout.force()
		// .gravity(.08)
		// .distance(40)
		// .charge(-90)
		// .size([width, height]);

		// console.log('d3.select("#vizSpotRelations").layout.force() : ');console.log( d3.select("#vizSpotRelations").layout.force() );
		removeNode( nodeData, d.accession, force );
		// update(force,nodes,links);
		console.log("nodeData : ");console.log( nodeData );
		console.log("force : ");console.log(force);
		// console.log("groupsReturned : ");console.log(groupsReturned);

		d3.selectAll("circle").style("stroke-width",2);
		d3.select(this).selectAll("circle").style("stroke-width", 4);

		d3.event.stopPropagation();
		// Fill in the infoVizRelations according to data returned
		document.getElementById("textData").innerHTML='<p>';
		var URLs = [];
		for (var prop in d.responseDoc) {
		  // skip loop if the property is from prototype
		  if(!d.responseDoc.hasOwnProperty(prop)) continue;
		  // d3.select("#textData").style("text-align","center");
		  // Should we calculate connections onclick or on loading ?
		  document.getElementById("textData").innerHTML+="<div class='textAttribute' onclick='linkPerAttributes(this)'"
		  + " id="+prop+" value="+d.responseDoc[prop]+" > <b>"+prop + " : </b>" + d.responseDoc[prop]+"" +"</div><br/>";

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
	.on("mouseup",function(d){
		d3.selectAll(".node").attr("isThereSelected",'false');
		d3.select("this").attr("theOneSelected",'false');
	})
	.on("mouseout",function(d){
		if ( d3.select(".node").attr("isThereSelected") == "false" ){
			d3.selectAll("text").style("opacity",1);
		  	d3.selectAll(".node").selectAll("text").style("dx", 12);
		  	// d3.selectAll(".node").selectAll("text").attr("transform","translate("+ 0 +","+0+")");
		  	// d3.selectAll(".node").selectAll("circle").transition().duration(10).style("r", this.radius);
			d3.select("#textHelp").html("Click on a node to display its information.");
		}
	})
	.on("mouseover",function(d){
		if ( d3.select(this).attr("isThereSelected") == 'false' ){
			var allNodes = d3.selectAll(".node");
			document.getElementById("elementHelp").style.visibility="visible";
			d3.select("#textHelp").html(""+d.accession);
			var circleNode = d3.select(this).selectAll("circle");
			var textNode = d3.select(this).select("text");

			d3.selectAll(".node").selectAll("text").style("opacity",.25);
			textNode.style("opacity",1);
			// circleNode.transition().duration(10).style("r", d.radius*3);
			// textNode.attr("transform","translate("+ d.radius*1.5 +","+0+")");
		} 
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
	.style("visibility", function(d){
		if ( d.accession.indexOf("SAMEG") > -1 ){
			return "visible";
		} else {
			return "hidden";
		}
	})
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

// This function is to load data according to the facets, when the number of nodes would be too high to directly display
function loadDataFromFacets( results, nodeData, vm,apiUrl, nameToNodeIndex ){
	console.log("!!!!!loadDataFromFacets 1 !!!!!");
	console.log("loadDataFromFacets in src/main/ressources/static/javascript/toolsFunctions");

	if (typeof nameToNodeIndex === "undefined"){ nameToNodeIndex = {}; }
	if (typeof nodeData === "undefined"){ nodeData = {}; }
	nodeData.nodes=[];
	nodeData.links=[];
	nodeData.facets=[];
	nodeData.accessions="";
	var groupsReturned = {};

	var maxAndMinFacet = {};
	var maxAndMinTotal = [];
	var scaleFacet;
	for (var i in results.data.facet_counts.facet_fields){
		var currentMin,currentMax;
		for (var j = 1; j<results.data.facet_counts.facet_fields[i].length; j=j+2 ){
			if ( typeof currentMin === 'undefined' || currentMin > results.data.facet_counts.facet_fields[i][j] )
				currentMin = results.data.facet_counts.facet_fields[i][j]
			if ( typeof currentMax === 'undefined' || currentMax < results.data.facet_counts.facet_fields[i][j] )
						currentMax = results.data.facet_counts.facet_fields[i][j]
		}
		maxAndMinFacet[i] = [ currentMin, currentMax ];
		if ( maxAndMinTotal.length == 0 ){
			maxAndMinTotal=[currentMin,currentMax];
		} else{ 
			if ( maxAndMinTotal[0] > currentMin )
				maxAndMinTotal[0] = currentMin;
			if ( maxAndMinTotal[1] < currentMax )
				maxAndMinTotal[1] = currentMax;
		}
	}
	scaleFacet = d3.scale.linear()
		.domain( maxAndMinTotal )
		.range([5,50]);

	var cptDomain =0; 
	for (var i in results.data.facet_counts.facet_fields){ cptDomain++ }
	var color = d3.scale.category20()
    	.domain(d3.range( cptDomain ));

	// Calculate how to cut the space facets into nodes
	var cptNodeToIndex = {};
	var cptIndex = 0;
	for (var i in results.data.facet_counts.facet_fields){
		nodeData.facets.push(i);
		var colorFacet = getRandomColor();
		for (var j=0; j < results.data.facet_counts.facet_fields[i].length;j++){
			if (j%2==0 && results.data.facet_counts.facet_fields[i][j+1] > 0 )
			{
				nodeData.nodes.push({
					"radius": scaleFacet( results.data.facet_counts.facet_fields[i][j+1] ),
					"r": scaleFacet( results.data.facet_counts.facet_fields[i][j+1] ),
					"index":cptIndex,
					"d":{
						cluster:results.data.facet_counts.facet_fields[i][0], 
						radius: scaleFacet(results.data.facet_counts.facet_fields[i][j+1]) },
					"color" : colorFacet,
					"type":"nodeFacet",
					"facet":i,
					"cluster":results.data.facet_counts.facet_fields[i][0],
					"readableContent":vm.$options.filters.excerpt(results.data.facet_counts.facet_fields[i][j],200),
					"name":results.data.facet_counts.facet_fields[i][j],
					"value":results.data.facet_counts.facet_fields[i][j+1]
				});
				cptIndex++;
			}
		}
	}

	return nodeData;
}

function drawFacets(svg,nodeData,vm){
	console.log("function drawFacets");

	document.getElementById("buttons-display").style.display="none";
	d3.select("#textHelp").html("Click on a node to display its information, and click twice to filter according to it.");

	var widthTitle = window.innerWidth;
	var width = Math.floor((70 * window.innerWidth)/100);
	var heightD3 = widthTitle/2;
	var height=heightD3;

    var padding = 25; // separation between same-color circles
    var clusterPadding = 50; // separation between different-color circles
    var maxRadius = 50;
	// The largest node for each cluster.
	var clusters = [];
	var cptClusters = 0;
	for (var i in nodeData.nodes){
		if (nodeData.nodes[i].cluster ==  nodeData.nodes[i].name){
			clusters.push(nodeData.nodes[i]);
		}
	}
	for ( var i = 0 ; i < nodeData.nodes.length; i++){
		for (var j = 0; j < clusters.length; j++ ){
			if ( clusters[j].facet == nodeData.nodes[i].facet ){
				nodeData.nodes[i].cluster = j;
				nodeData.nodes[i].d.cluster = j;
				var indexForID =  clusters[j].index ;
				d3.select("#text_"+indexForID).style("visibility", "visible");
			}
		}
	}

	var force = d3.layout.force()
		.nodes(nodeData.nodes)
		.links(nodeData.links)
		.size([width, height])
		.gravity(0)
		.charge(0)
		.start();

	//Add nodes to the svgContainer
	var node = svg.selectAll("node")
	.data(nodeData.nodes)
	.enter().append("g")
	.attr("class","node")
	.call(force.drag)
	;

	var links = svg.selectAll(".link")
	.data(nodeData.links)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) { return Math.sqrt(d.weight); });

	node
	.attr("name", function (d) { return d.name; })
	.attr("readableContent", function (d) { return d.readableContent; })
	.attr("class", function (d) { return "node"; })
	.attr("isThereSelected",function(d){ return 'false';})
	.attr("theOneSelected",function(d){return 'false'})
	.attr("value", function (d) { return d.value; })
	.attr("facet", function (d) { return d.facet; })
	.attr("cluster", function (d) { return d.cluster; })
	.attr("radius", function (d) { return d.radius; })
	.attr("r", function (d) { return d.radius; })
	.attr("color", function (d) { return d.color; })
	.attr("type",function(d){return d.type;})
	.attr("id", function(d){
		return 'node_'+d.index;
	})
	.style("stroke-width",1)
	.style("fill", function (d) { return d.color; })
	.on("contextmenu",function(d){
		// console.log("RIGHT CLICK ? YEAH");
		d3.event.preventDefault();
	})
	.on("mousedown",function(d){
		d3.selectAll(".node").attr("isThereSelected",'true');
		d3.select(this).attr("theOneSelected",'true');
		d3.event.stopPropagation();
		d3.selectAll("circle").style("stroke-width",2);
		d3.select(this).select("circle").style("stroke-width", 4);
		var indexFilter = d.facet.indexOf( "_crt_ft" );
		var nameFacet = d.facet;
		if ( indexFilter > -1 ){ nameFacet = d.facet.substr(0,indexFilter); }		
		var newText = "<p> <b>Facet : </b>"+nameFacet+"<hr/>"+"<b> Name : </b>"+d.name+" : "+d.value+"</p>";
		document.getElementById("textData").innerHTML=newText;

		d3.selectAll(".node").selectAll("text").style("visibility",function(d2){
			if ( d2.cluster == d.cluster ){
				// d3.select(this)[0][0].textContent = '['+d2.name+']';
				// console.log("d2.readableContent: ");console.log(d2.readableContent);
				d3.select(this)[0][0].textContent = '['+d2.readableContent+']';
				return "visible";
			} else {
				if ( clusters[d2.cluster].index == d2.index ){
					var indexFilter = d2.facet.indexOf( "_crt_ft" );
					var nameFacet = d2.facet;
					if ( indexFilter > -1 ){ nameFacet = d2.facet.substr(0,indexFilter); }
					d3.select(this)[0][0].textContent = "["+nameFacet+"]";
					return "visible";
				} else {
					var indexFilter = d2.facet.indexOf( "_crt_ft" );
					var nameFacet = d2.facet;
					if ( indexFilter > -1 ){ nameFacet = d2.facet.substr(0,indexFilter); }
					d3.select(this)[0][0].textContent = "["+nameFacet+"]";
					return "hidden";
				}
			}
		});
	})
	.on("mouseup",function(d){
		d3.selectAll(".node").attr("isThereSelected",'false');
		d3.select(this).attr("theOneSelected",'false');
	})
	.on("mouseover",function(d){
		document.getElementById("elementHelp").style.visibility="visible";
		if ( d3.select(".node").attr("isThereSelected")=="false" ){
			console.log("There is no selected people ");
			// d3.select("#textHelp").html("Double click on a node to filter the results according to this facet <hr/>"+d.facet+"<hr/>"+d.name+"<hr/>"+d.value+" elements");
			d3.select("#textHelp").html("Double click on a node to filter the results according to this facet <hr/>"+d.facet+"<hr/>"+d.readableContent+"<hr/>"+d.value+" elements");
		}
	})
	.on("mouseout",function(d){
		if ( d3.select(".node").attr("isThereSelected")=='false' ){
			d3.select("#textHelp").html("Click on a node to display its information, and click twice to filter according to it.");
		}
	})
	.on("dblclick",function(d){
		console.log("dblclick nodeFacet");
		var indexFilter = d.facet.indexOf( "_crt_ft" );
		var nameFilter = d.facet;
		if ( indexFilter > -1 ){ nameFilter = d.facet.substr(0,indexFilter); }
		nameFilter+='Filter';
		vm.$data.filterQuery[ nameFilter ] = d.name;
		vm.$emit("bar-selected");
		document.getElementById("infoPop").innerHTML=" Filtering the results according to "+d.name;
		popOutDiv("infoPop");
		fadeOutDiv("infoPop");
		vm.$options.methods.querySamples(this,false);
	});

	node.append("circle")
	.attr("r", function (d) { return d.radius; })
	.attr("name", function (d) { return d.name; })
	.attr("index", function (d) { return d.index; })
	.attr("facet", function (d) { return d.facet; })
	.attr("radius", function (d) { return d.radius; })
	.attr("color", function (d) { return d.color; })
	.style("fill", function (d) {  return d.color; })
	.style("stroke","black")
	.style("stroke-width",2)
	.style("stroke-opacity",1)
	.style("opacity", .7)
	;

	node.append("text")
	.attr("dx", 12)
	.attr("dy", ".35em")
	.attr("id",function(d){ return 'text_'+d.index})
	.attr("name",function(d){return d.name})
	// .text( function (d) { return "["+d.name+"]"; })
	.text( function (d) {
		var indexFilter = d.facet.indexOf( "_crt_ft" );
		var nameFacet = d.facet;
		// var nameFacet = d.readableContent;
		if ( indexFilter > -1 ){ nameFacet = nameFacet.substr(0,indexFilter); }
		return "["+nameFacet+"]";
	})
	.attr("font-family", "sans-serif").attr("font-size", "10px")
	.attr("border","solid").attr("border-radius","10px")
	.style("visibility", function(d){
		if ( d.index == clusters[d.cluster].index ){
			return "visible";
		} else {
			return "hidden";
		}
	})
	.style("border","solid").style("border-radius","10px")
	.style("box-shadow","gray")
	.style("background-color","#46b4af")
	.attr("fill", "#4D504F")
	.on("mouseover",function(d){
		d3.selectAll(".node").selectAll("text").style("font-size", "10px");
	})
	;

	// Moved to be adjacent to the cluster node.
	function cluster(alpha){
	  return function(d) {
	    var cluster = clusters[d.cluster], k = 1;
	    if (typeof cluster !== 'undefined'){
		    // For cluster nodes, apply custom gravity.
		    if (cluster === d) {
		      cluster = {x: width / 2, y: height / 2, radius: -d.radius};
		      k = .1 * Math.sqrt(d.radius);
		    }
		    var x = d.x - cluster.x,
		        y = d.y - cluster.y,
		        l = Math.sqrt(x * x + y * y),
		        r = d.radius + cluster.radius;

		    if (l != r) {
		      l = (l - r) / l * alpha * k;
		      d.x -= x *= l;
		      d.y -= y *= l;
		      cluster.x += x;
		      cluster.y += y;
		    }
		}
	  };
	}

	// Resolves collisions between d and all other circles.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodeData.nodes);
	  return function(d) {
	    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
	        nx1 = d.x - r,
	        nx2 = d.x + r,
	        ny1 = d.y - r,
	        ny2 = d.y + r;

	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y),
	            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
	        if (l < r) {
	          l = (l - r) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}

	// Force rules:
	force.on("tick", function(e) {
	  	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	  	d3.selectAll(".node")
	      .each(cluster(10 * e.alpha * e.alpha))
	      .each(collide(.5))
	});

	d3.select(self.frameElement).style("height", width - 150 + "px");
}

function displayRevertingFilters( results,vm ){
	// Display the filters in filterEmergencyDisplay if we have both filters and empty results
	var displayRemainingFilters = false;
	// remainingfilters[ facet ] = [filter,...]
	var remainingfilters = {};
	function infoDisplayFilters (results){
	    var needToDisplay = false; var arrayFilters = [];
	    if ( results.data.response.docs.length == 0 ){
	        for (var i in results.request.params.filters){
	            var indexPipe = results.request.params.filters[i].indexOf("|");
	            if ( indexPipe != results.request.params.filters[i].length-1 ){
	                arrayFilters.push(results.request.params.filters[i]);
	                needToDisplay = true;
	            } 
	        }
	    }
	    // New version with display of filters all the time
	    else {
	        for (var i in results.request.params.filters){
	            var indexPipe = results.request.params.filters[i].indexOf("|");
	            if ( indexPipe != results.request.params.filters[i].length-1 ){
	                arrayFilters.push(results.request.params.filters[i]);
	                needToDisplay = false;
	            } 
	        }
	    }
	    return [needToDisplay,arrayFilters];
	}

	displayRemainingFilters = infoDisplayFilters(results);
	d3.select("#displayRemainingFilters").selectAll("*").remove();

	if ( displayRemainingFilters[0]){
    	d3.select("#displayRemainingFilters").selectAll("*").remove();
		if ( displayRemainingFilters[1].length>0 ){
			document.getElementById("displayRemainingFilters").innerHTML=("<p>Empty results from your query might be due to the following filters:<br/><div id='revertFilters'></div>");
		    for (var i in displayRemainingFilters[1]){
		        var indexToCut =  displayRemainingFilters[1][i].indexOf("|"); var facet = displayRemainingFilters[1][i].substring(0, indexToCut);
		        var indexToCutFacet = facet.indexOf("Filter");
		        facet = facet.substring(0,indexToCutFacet);
		        var value = displayRemainingFilters[1][i].substring(indexToCut+1, displayRemainingFilters[1][i].length);
		        // Create buttons
		        var divReverter = 'buttonFilter_'+facet;
		        var badgeFacet,badgeValue;
		        badgeFacet = facet.replace(/-/g, "--"); badgeFacet = badgeFacet.replace(/_/g, "__"); badgeFacet = badgeFacet.replace(/\ /g, "%20");
		        badgeValue = value.replace(/-/g, "--"); badgeValue = badgeValue.replace(/_/g, "__"); badgeValue = badgeValue.replace(/\ /g, "%20");
				var stringColumn = '<div style="display:inline" facet='+facet+' value='+value+' class="reverter" id="'+ divReverter +'">'
					+'<img style="display:inline" src="https://img.shields.io/badge/'+badgeFacet+'-'+badgeValue+'-orange.svg?style=flat">'
					+'<p style="display:inline" facet='+facet+' value='+value+' class="crossDelete">&#10006;</p>'
					+'</div>';
				document.getElementById("revertFilters").innerHTML+= stringColumn;
		    }
		    document.getElementById("displayRemainingFilters").innerHTML+="<br/>";
		} else {
			d3.select("#displayRemainingFilters").selectAll("*").remove();
		}
	} // New version of the code with filters displayed also when the results are not empty
	else {
    	d3.select("#displayRemainingFilters").selectAll("*").remove();
		if ( displayRemainingFilters[1].length>0 ){
			document.getElementById("displayRemainingFilters").innerHTML=("<p>Current filters:<br/><div id='revertFilters'></div>");
		    for (var i in displayRemainingFilters[1]){
		        var indexToCut =  displayRemainingFilters[1][i].indexOf("|"); var facet = displayRemainingFilters[1][i].substring(0, indexToCut);
		        var indexToCutFacet = facet.indexOf("Filter");
		        facet = facet.substring(0,indexToCutFacet);
		        var value = displayRemainingFilters[1][i].substring(indexToCut+1, displayRemainingFilters[1][i].length);
		        // Create buttons
		        var divReverter = 'buttonFilter_'+facet;
		        var badgeFacet,badgeValue;
		        badgeFacet = facet.replace(/-/g, "--"); badgeFacet = badgeFacet.replace(/_/g, "__"); badgeFacet = badgeFacet.replace(/\ /g, "%20");
		        badgeValue = value.replace(/-/g, "--"); badgeValue = badgeValue.replace(/_/g, "__"); badgeValue = badgeValue.replace(/\ /g, "%20");
				var stringColumn = '<div style="display:inline" facet='+facet+' value='+value+' class="reverter" id="'+ divReverter +'">'
					+'<img style="display:inline" src="https://img.shields.io/badge/'+badgeFacet+'-'+badgeValue+'-orange.svg?style=flat">'
					+'<p style="display:inline" facet='+facet+' value='+value+' class="crossDelete">&#10006;</p>'
					+'</div>';

				document.getElementById("revertFilters").innerHTML+= stringColumn;
		    }
		    document.getElementById("displayRemainingFilters").innerHTML+="<br/>";
		} else {
			d3.select("#displayRemainingFilters").selectAll("*").remove();
		}
	}

    // $('div.crossDelete').click(function(e){
	$('.crossDelete').click(function(e){
        facet = d3.select(this).attr('facet');
        vm.$data.filterQuery[facet+'Filter'] = "";
        vm.$emit("bar-selected");
    });

    d3.selectAll('.crossDelete').on("mouseover",function(d){
        d3.selectAll('.crossDelete').style("background-color","white");
        d3.selectAll('.crossDelete').style("color","black");
        if ( this.id.length > 0 ){
            d3.select('#'+this.id).style("background-color","black");
            d3.select('#'+this.id).style("color","white");
        }
    });
    d3.selectAll('.crossDelete').on("mouseout",function(d){
        d3.selectAll('.crossDelete').style("background-color","white");
        d3.selectAll('.crossDelete').style("color","black");
    });

}

// var update = function (force,nodes,links) {
// 	console.log("update");
// 	var vis = d3.select("#vizSpotRelations");
// 	var link = vis.selectAll("line")
// 		.data(links, function (d) {
// 			return d.source.id + "-" + d.target.id;
// 		});

//     link.enter().append("line")
//             .attr("id", function (d) {
//                 return d.source.id + "-" + d.target.id;
//             })
//             .attr("stroke-width", function (d) {
//                 return d.value / 10;
//             })
//     link.append("title")
//             .text(function (d) {
//                 return d.value;
//             });
//     link.exit().remove();

//     var node = vis.selectAll("g.node")
//             .data(nodes, function (d) {
//                 return d.id;
//             });

//     var nodeEnter = node.enter().append("g")
//             .attr("class", "node")
//             .call(force.drag);

//     nodeEnter.append("svg:circle")
//             .attr("r", 12)
//             .attr("id", function (d) {
//                 return "Node;" + d.id;
//             })
//             .attr("fill", function(d) { return color(d.id); });

//     nodeEnter.append("svg:text")
//             .attr("class", "node")
//             .text(function (d) {
//                 return d.id;
//             });

//     node.exit().remove();

//     // Restart the force layout.
// 	var widthTitle = window.innerWidth;
// 	var width = Math.floor((70 * window.innerWidth)/100);
// 	var heightD3 = widthTitle/2;
// 	var height=heightD3;

//     var w = width, h = height;
//     force
// 	    .gravity(.01)
// 	    .charge(-80000)
// 	    .friction(0)
// 	    .linkDistance( function(d) { return d.value * 10 } )
// 	    .size([w, h])
// 	    .start();
// };

function removeNode(nodeData,nodeAccession, force){
	console.log("removeNode");
	d3.select( "#node_"+nodeAccession ).remove();
	var indexToCut;
	for (var i =0; i <nodeData.nodes.length;i++){
		if ( nodeData.nodes[i].accession == nodeAccession ){
			indexToCut = i;
		}
	}
	var linksToCut = [];
	var accesionsSourceToCut = [];
	var accesionsTargetToCut = [];
	for (var i = 0; i < nodeData.links.length; i++){
		if ( nodeData.links[i].source.accession == nodeAccession || nodeData.links[i].target.accession == nodeAccession ){
			accesionsSourceToCut.push( nodeData.links[i].source.accession );
			accesionsTargetToCut.push( nodeData.links[i].target.accession );
			linksToCut.push(i);
		}
	}
	nodeData.nodes.splice(indexToCut,1);

	// id of link is #link_source_target
	for (var i =0; i < accesionsSourceToCut.length;i++){
		d3.select( "#link_"+accesionsSourceToCut[i]+"_"+accesionsTargetToCut[i]).remove();
	}

	var i = linksToCut.length-1; 
	while(i >= 0){
		nodeData.links.splice(linksToCut[i],1);
		i--;
	}

	force
	.nodes(nodeData.nodes)
	.links(nodeData.links)
	.start()
	;
}