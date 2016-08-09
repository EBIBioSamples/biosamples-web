(function(window) {
    var app = require("ols-graphview");
    
    var accession = window.accession;
    var relationsUrl = window.relationsUrl;
    var originUrl = window.baseUrl ? window.baseUrl : window.location.origin;


    function buildGraphUrl(baseUrl,accession) {
        //return `${baseUrl}${sampleOrGroup(accession)}/${accession}/graph`;
        return `../${sampleOrGroup(accession)}/${accession}/graph`;
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

    function isCluster(parameter){
        console.log(parameter);
        console.log(parameter.indexOf("__"));
        if (parameter.indexOf("__")===-1)
        {
            return false;
        }
        else {
            return true;
        }
    }

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
                if (!isCluster(nodeAccession)) {
                    instance.fetchNewGraphData(buildGraphUrl(relationsUrl, nodeAccession));
                }
            },
            onDoubleClick: function (params) {
                console.log("Double click!");

                let nodeAccession = params.nodes[0];
                if (!isCluster(nodeAccession)) {
                    //Have to be funky and get rid of the last letter, namely an s to turn sampleS/groupS to sample/group
                    let singleContentType = sampleOrGroup(nodeAccession).slice(0, -1);
                    window.location = `${originUrl}${singleContentType}/${nodeAccession}`;
                }



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