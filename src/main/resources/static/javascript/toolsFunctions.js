function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[ 1 + Math.floor(Math.random() * 15)];
  }
  return color;
}

function loadBars(width,height,margin,results,dataBar1,dataBar2,dataBars){

}

function getURLsFromObject(objectToRead,prop){
	var arrayUrls = [];
	var arrayImgTypes = [".jpg",".png",".jpeg",".tiff",".gif"," .jif",".jfif",".jp2",".jpx",".j2k",".j2c",".fpx",".pcd",".pdf"];
	// Loop through the img file formats, and if found, get the url, then add its display in infoVizRelations
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

function loadDataFromGET(results, nodeData,groupsReturned,nameToNodeIndex){
	if (typeof nameToNodeIndex === "undefined"){ nameToNodeIndex = {}; }
	nodeData.group = [];
	nodeData.color=[];

	for (var i=0;i< results.data.response.docs.length;i++){
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
			nameToNodeIndex[ results.data.response.docs[i].accession[0] ] = nodeData.nodes.length-1;
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
			  groupsReturned[results.data.response.docs[i].sample_grp_accessions[0]].push(results.data.response.docs[i].accession[0]);
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
		nameToNodeIndex[results.data.response.docs[i].accession[0]]=nodeData.nodes.length-1;
	}

	var accessionToIndex={};
	// Step 1: save from group to sample in nodes
	for (var i=0; i < nodeData.nodes.length;i++){
		//nodeData.nodes.push({"name":nodeData.stuff[i].accession[0]});
		accessionToIndex[nodeData.nodes[i].accession[0]] = i;
		nodeData.group[i]='';
		nodeData.color[i]='';
	}
	// Step 2: for every element in the group to sample, create a link (do it just once)
	var indexCalculation=0;
	for (var group in groupsReturned){
		// TODO: GET request to get the information in global about the samples within the group
		colorGroup = getRandomColor();
		indexCalculation++;
		nodeData.nodes.push({
			"radius": 10,
			//"color" : getRandomColor(), 
			"type":"groupViz",
			"name":group,
			"accession":group,
			"sample_grp_accessions":undefined,
		    "Derived_From_crt": undefined,"Same_As_crt": undefined,"Child_Of_crt": undefined,
		    "id": undefined,"responseDoc":undefined,
		    "color":colorGroup
		});
		nodeData.group.push(group);
		nodeData.color.push(colorGroup);
		nameToNodeIndex[group]=nodeData.nodes.length-1;

		for (var i=0; i < groupsReturned[group].length;i++){
			nodeData.group[ nameToNodeIndex[ groupsReturned[group][i]] ] = group;

			if (typeof nameToNodeIndex[ groupsReturned[group][i] ] !== 'undefined'){
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
	return [nodeData,groupsReturned,nameToNodeIndex];
}

function loadLinks(results){
	return [];
}

function getSamplesFromGroup(apiUrl,group){

}

