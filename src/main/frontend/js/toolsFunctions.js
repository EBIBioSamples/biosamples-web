function getRandomColor() {
  //console.log("getRandomColor");
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function getURLsFromObject(objectToRead,prop){
	var arrayUrls = [];

	//console.log("getURLsFromObject, objectToRead : ");
	//console.log(objectToRead);
	var arrayImgTypes = [".jpg",".png",".jpeg",".tiff",".gif"," .jif",".jfif",".jp2",".jpx",".j2k",".j2c",".fpx",".pcd",".pdf"];
	// Loop through the img file formats, and if found, get the url, then add its display in infoVizRelations
	for (var i =0; i < arrayImgTypes.length;i++){
	  if (typeof objectToRead[prop] == "string" ){
	    // Loop through different kind of common separators, and turn the string into an array. Then you can use the code previously used to work with an array
	    var strCutSymbols=[];
	    strCutSymbols.push(objectToRead[prop].split(","));
	    strCutSymbols.push(objectToRead[prop].split(";"));
	    strCutSymbols.push(objectToRead[prop].split(" "));
	    //console.log("strCutSymbols : ");console.log(strCutSymbols);
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
	            //console.log("url : "+url);
	            //document.getElementById("infoVizRelations").innerHTML+="<a href=\""+url+"\">link text</a>+<br/>";
	            //document.getElementById("infoVizRelations").innerHTML+="<img src=\""+url+"\" alt=\"google.com\" style=\"height:200px;\" >";                      
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
	        //console.log("url : "+url);
	        //document.getElementById("infoVizRelations").innerHTML+="<a href=\""+url+"\">link text</a>+<br/>";
	        //document.getElementById("infoVizRelations").innerHTML+="<img src=\""+url+"\" alt=\"google.com\" style=\"height:200px;\" >";                      
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
	        //console.log("url : "+url);
	        //document.getElementById("infoVizRelations").innerHTML+="<a href=\""+url+"\">link text</a>+<br/>";
	        //document.getElementById("infoVizRelations").innerHTML+="<img src=\""+url+"\" alt=\"google.com\" style=\"height:200px;\" ><br/>";
	        arrayUrls.push(url);
	      }
	    }
	  }
	}
	return arrayUrls;
}


// TODO: reading attributes Same_As_crt, Derived_From_crt, Child_Of_crt, fill in in nodeData: nodes and links
function loadDataFromGET(results, nodeData,circleData){
	for (var i=0;i< results.data.response.docs.length;i++){
		//Circle Data Set
		// Group
		if (results.data.response.docs[i].content_type=="group"){
		  circleData.push({ /*"x":i*60 + 30,*/ "cx": i*60 + 30/*,"y":i*30 + 125*/, "cy": i*30 + 125, "radius": 10, "color" : "black", "type":"group", "accession":results.data.response.docs[i].accession,
		    "Group_Name_crt": results.data.response.docs[i].Group_Name_crt,
		    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i]});
		  nodeData.stuff.push({ "x": i*60 + 30, "y": i*30 + 125, "cx": i*60 + 30, "cy": i*30 + 125, "radius": 10, "color" : "black", "type":"group", "accession":results.data.response.docs[i].accession,
		    "Group_Name_crt": results.data.response.docs[i].Group_Name_crt, 
		    "Derived_From_crt": results.data.response.docs[i].Derived_From_crt,"Same_As_crt": results.data.response.docs[i].Same_As_crt,"Child_Of_crt": results.data.response.docs[i].Child_Of_crt,
		    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i],
		  });
		} else {
		  circleData.push({ /*"x":i*60 + 30,*/ "cx": i*60 + 30/*,"y":i*30 + 125*/, "cy": i*30 + 125, "radius": 10, "color" : getRandomColor(), "type":"sample", "accession":results.data.response.docs[i].accession,
		    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i]});
		  nodeData.stuff.push({ "x": i*60 + 30, "y": i*30 + 125, "cx": i*60 + 30, "cy": i*30 + 125, "radius": 10, "color" : getRandomColor(), "type":"sample", "accession":results.data.response.docs[i].accession,
		    "Group_Name_crt": results.data.response.docs[i].Group_Name_crt, 
		    "Derived_From_crt": results.data.response.docs[i].Derived_From_crt,"Same_As_crt": results.data.response.docs[i].Same_As_crt,"Child_Of_crt": results.data.response.docs[i].Child_Of_crt,
		    "id": results.data.response.docs[i].id,"responseDoc":results.data.response.docs[i],		    
		  });
		}
	}

	// Temporary code, in the future we will not keep circleData
	return [nodeData,circleData];
}

function getSamplesFromGroup(apiUrl,group){

}
