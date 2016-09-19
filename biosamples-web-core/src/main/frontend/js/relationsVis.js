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
        return !(parameter.indexOf("__") == -1);
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
            __changingPage: false,
            onClick: function (params) {

                if (this.__changingPage) {
                    return;
                }
                let nodeAccession = params.nodes[0];
                let singleClick = params.event.tapCount == 1;
                console.log("Parameters:", params);
                console.log(params.nodes[0]);
                console.log("Selected");

                if (!isCluster(nodeAccession)) {
                    if (!singleClick) {
                        let singleContentType = sampleOrGroup(nodeAccession).slice(0, -1);
                        window.location = `${originUrl}${singleContentType}/${nodeAccession}`;
                        this.__changingPage = true;
                        return;
                    } else {
                        instance.fetchNewGraphData(buildGraphUrl(relationsUrl, nodeAccession));
                    }
                }
                else{
                    instance.unclusterANode(nodeAccession)
                }
            },
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