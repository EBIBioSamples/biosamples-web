/**
 * Created by tburdett on 24/02/16.
 */
$(document).ready(function(){
    initializeLinks();
});

function initializeLinks() {
    console.log("Checking characteristic-mappings");
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
                if (json.ontology_terms[0]) {
                    mapping.children("a").attr("href", json.ontology_terms[0]);
                }
                else {
                    console.log("Need to remove this link"); // todo
                }
            }
        });
    });
}