/**
 * Created by tliener on 24/05/2016.
 */

var url=document.URL;
// Parse the sample/group accession out of the URL
var reversed = url.split("").reverse().join("");
var tmp=reversed.substring(0,reversed.indexOf("/"));
var term=tmp.split("").reverse().join("")


function sampleOrGroup(accession){
    var isGroup=accession.substring(0,5).indexOf("G")
    if (isGroup===-1)
    {
        console.log("It's a sample!")
        return "samples"
    }
    else
    {
        console.log("It is a group!")
        return "groups"
    }
}

/* Silly way to check if we are on a groups or sampes page*/
//if (document.getElementById("samples")!=null)
//    path="samples"
//if (document.getElementById("groups")!=null)
//    path="groups"



var graphURL="http://localhost:8081/"+sampleOrGroup(term)+"/"+term+"/graph"

console.log("This is a .... ")
sampleOrGroup(term)



var app = require("ols-graphview");
var tmpnetworkOptions={
    webservice : {URL: graphURL, OLSschema: false},
    displayOptions : {showButtonBox:true, showInfoWindow:false, showLegend:true},
    appearance:{nodeShowShortId:false},
    callbacks: {

            onSelectNode:function(params){console.log(params); console.log(params.nodes[0]);
            instance.fetchNewGraphData("http://beans:9480/biosamples/relations/"+sampleOrGroup(params.nodes[0])+"/"+params.nodes[0]+"/graph")},
            onDoubleClick:function(params){console.log(params); },
            onSelectEdge:function(params){console.log(params); }
    },
    loadingBar :{
        pictureURL: "../images/loading.gif",
        initialLoadingPicture: true
    },
    dataOptions:{showAllRelationships:true}
}

var visoptions={
        interaction:{hover:true, navigationButtons:false, keyboard: false},
        nodes:{shape: "dot"}
};


var instance = new app();
instance.visstart("ontology_vis", term, tmpnetworkOptions,visoptions);