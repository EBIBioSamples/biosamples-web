/**
 * Created by tliener on 24/05/2016.
 */
(function(window) {
    var app = require("ols-graphview");
    
    var accession = window.accession;
    var relationsUrl = window.relationsUrl;
    var originUrl = window.location.origin;

    // Parse the sample/group accession out of the URL
    // var url = document.URL;
    // var reversed = url.split("").reverse().join("");
    // var tmp = reversed.substring(0, reversed.indexOf("/"));
    // var term = tmp.split("").reverse().join("");
    function buildGraphUrl(baseUrl,accession) {
        return `${baseUrl}${sampleOrGroup(accession)}/${accession}/graph`;
    }

    function sampleOrGroup(accession) {
        var isGroup = accession.substring(0, 5).indexOf("G");
        if (isGroup === -1) {
            return "samples"
        }
        else {
            return "groups"
        }
    }

/*
//This function parses the relations URL out the sample biosamples url
    function parseURL(urlparsing) {

// if (urlparsing.substring(0,16)==="http://localhost")
//     {   //if the url is localhost, return the 8081 endpoint - it is expected that the relations API runs at this port
//         return "http://localhost:8081/";
//     }
// else {
        //This part parses the url if it is not localhost, preparing the url for requests for relations API
        // debugger;
        var reversed = urlparsing.split("").reverse().join("");
        var base = reversed.substring(reversed.indexOf("/") + 1, reversed.length);
        base = base.substring(base.indexOf("/"), base.length);
        var baseurl = base.split("").reverse().join("");
        baseurl = baseurl + "relations/";
        return baseurl;
    }
// }
*/

// console.log(parseURL("http://beans:9480/biosamples/sample/SAMEA2799418")+sampleOrGroup(term)+"/"+term+"/graph");
//     var graphURL = parseURL(url) + sampleOrGroup(term) + "/" + term + "/graph";

    var graphURL = buildGraphUrl(relationsUrl,accession);
    console.log(graphURL);

    var tmpNetworkOptions = {
        webservice: {
            URL: graphURL, 
            OLSschema: false
        },
        displayOptions: {
            showButtonBox: true, 
            showInfoWindow: false, 
            showLegend: true
        },
        appearance: {
            nodeShowShortId: false
        },
        
        callbacks: {
            onSelectNode: function (params) {
                let nodeAccession = params.nodes[0];
                console.log(params);
                console.log(params.nodes[0]);
                console.log("Selected");
                instance.fetchNewGraphData(buildGraphUrl(relationsUrl,nodeAccession));
                
                // instance.fetchNewGraphData("http://localhost:8081/" + sampleOrGroup(params.nodes[0]) + "/" + params.nodes[0] + "/graph");
            },
            onDoubleClick: function (params) {
                console.log("Double click!");

                let nodeAccession = params.nodes[0];
                //Have to be funky and get rid of the last letter, namely an s to turn sampleS/groupS to sample/group
                let singleContentType = sampleOrGroup(nodeAccession).slice(0, -1);
                window.location = `${originUrl}/${singleContentType}/${nodeAccession}`;


                //Have to be funky and get rid of the last letter,namly an s to turn sampleS/groupS to sample/group
                // window.location = parseURL(url) + sampleOrGroup(params.nodes[0]).substring(0, sampleOrGroup(params.nodes[0]).length - 1) + "/" + params.nodes[0];
            },
            onSelectEdge: function (params) {
            }
        },
        loadingBar: {
            pictureURL: "../images/loading.gif",
            initialLoadingPicture: true
        },
        dataOptions: {showAllRelationships: true}
    };

    var visOptions = {
        interaction: {hover: true, navigationButtons: false, keyboard: false},
        nodes: {shape: "dot"}
    };

    var instance = new app();
    instance.visstart("ontology_vis", accession, tmpNetworkOptions, visOptions);
})(window);