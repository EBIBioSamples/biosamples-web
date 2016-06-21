/**
 * Created by tburdett on 24/02/16.
 */
var olsSearchLink = "http://www.ebi.ac.uk/ols/beta/search?start=0&groupField=iri&exact=on&q=";

$(document).ready(function(){
    initializeLinks();
});

function initializeLinks() {
    console.log("Checking characteristic-mappings");
    charactersticsMapping();
    accessionMapping();
}

function charactersticsMapping() {
    $(".characteristic-mapping").each(function(){
        // get JSON payload for each element
        var mapping = $(this);
        mapping.children(".characteristic-mapping-payload").each(function() {
            var quotedPayload = $(this).html();
            var jsonStr;
            if (quotedPayload.charAt(0) === '"' && quotedPayload.charAt(str.length -1) === '"'){
                jsonStr = quotedPayload.substr(1, str.length-2);
            }
            else {
                jsonStr = quotedPayload;
            }
            var json = jQuery.parseJSON(jsonStr);
            if (json.ontology_terms) {
                console.log("Found ontology term for '" + json.text + "': " + json.ontology_terms);
                if (json.ontology_terms[0]) {
                    var link = olsSearchLink + encodeURIComponent(json.ontology_terms[0]);
                    mapping.html("<a href=\"" + link + "\" target='_blank'>" + json.text + "</a>");
                }
                else {
                    console.log("Something went wrong - ontology_terms collection present but no first element?");
                }
            }
            else {
                console.log("No ontology term for '" + json.text + "'");
                mapping.text(json.text);
            }
        });
    });
}

function accessionMapping() {
    
}