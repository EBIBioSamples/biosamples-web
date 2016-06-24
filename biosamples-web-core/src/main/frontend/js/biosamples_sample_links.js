/**
 * Created by tburdett on 24/02/16.
 */
var olsSearchLink = "http://www.ebi.ac.uk/ols/beta/search?start=0&groupField=iri&exact=on&q=";

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

    console.log("Checking external-references-payload");
    $(".external-references-payload").each(function(){
        // get JSON payload 
        var quotedPayload = $(this).html();
        var mapping = $(this);
        var jsonStr;
        if (quotedPayload.charAt(0) === '"' && quotedPayload.charAt(str.length -1) === '"'){
            jsonStr = quotedPayload.substr(1, str.length-2);
        }
        else {
            jsonStr = quotedPayload;
        }
        var json = jQuery.parseJSON(jsonStr);
        var output = "";
        $.each( json, function( index, value ) {
            if (value.URL.indexOf("/ena/") > -1) {
                output += "<a href=\""+value.URL+"\" target='_blank'>"+value.Acc+"<img src=\"../images/ena_logo.gif\"></img></a>";
            } else {
                output += "<a href=\""+value.URL+"\" target='_blank'>"+value.Acc+"</a>";
            	
            }
            if (index < json.length-1) {
            	output += "<br />";
            }
        });
        mapping.html(output); 
    });

    console.log("Checking publications-payload");
    $(".publications-payload").each(function(){
        // get JSON payload 
        var quotedPayload = $(this).html();
        var mapping = $(this);
        var jsonStr;
        if (quotedPayload.charAt(0) === '"' && quotedPayload.charAt(str.length -1) === '"'){
            jsonStr = quotedPayload.substr(1, str.length-2);
        }
        else {
            jsonStr = quotedPayload;
        }
        var json = jQuery.parseJSON(jsonStr);
        var output = "";
        $.each( json, function( index, value ) {
            output += "<a href=\"http://europepmc.org/abstract/MED/"+value.pubmed_id+"\" target='_blank'>"+value.pubmed_id+"</a>";
            
            if (index < json.length-1) {
            	output += "<br />";
            }
        });
        mapping.html(output); 
    });
}