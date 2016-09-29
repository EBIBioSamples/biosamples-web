
(function($){
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
                        if (json.unit) {
                        	mapping.html(json.text + "( <a href=\"" + link + "\" target='_blank'>"+json.unit+"</a> )");
                        } else {
                        	mapping.html("<a href=\"" + link + "\" target='_blank'>" + json.text + "</a>");                        	
                        }
                    }
                    else {
                        console.log("Something went wrong - ontology_terms collection present but no first element?");
                    }
                }
                else {
                	if (json.unit) {
	                    console.log("No ontology term for '" + json.text + "'");
	                    mapping.text(json.text+" ("+json.unit+")");                		
                	} else {
	                    console.log("No ontology term for '" + json.text + "'");
	                    mapping.text(json.text);
                	}
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

        $('.organization-field-content').each(function(){

            var element = $(this);
            var rawString = element.html();
            var json = $.parseJSON(rawString);
            var output = "";
            $.each( json, function(index,value) {
                if (value.URL) {
                    output += "<a href='" + value.URL + "' target='_blank'>" + value.Name + "</a>";
                } else {
                    output += value.Name;
                }
                if (value.Role) {
                    output += " (" + value.Role.trim() + ")";
                }

                if (index < json.length - 1) {
                    output += "<br/>";
                }
            });
            element.html(output);
        });

        $('.contact-field-content').each(function(){

            var element = $(this);
            var rawString = element.html();
            var json = $.parseJSON(rawString);
            var output = "";
            $.each( json, function(index,value) {
                output += value.Name;
                if (index < json.length - 1) {
                    output += "<br/>";
                }
            });
            element.html(output);
        });

        $('.publications-field-content').each(function(){

            var element = $(this);
            var rawString = element.html();
            var json = $.parseJSON(rawString);
            var output = "";
            var deferreds = [];
            $.each( json, function(index,value) {
                var apiUrl = getEuropePmcUrl(value.pubmed_id);
                deferreds.push($.get(apiUrl).success(function(data) {
                    var pub = getPublicationsWithId(value.pubmed_id, data);
                    if (pub) {
                        console.log(output);
                        output +=
                           "<a href='//www.europepmc.org/abstract/" + pub.source + "/" + pub.pmid + "' target='_blank'>"
                            + pub.title +
                           "</a>";
                        if (index < json.length - 1) {
                            output += "<br />";
                        }
                    }
                }));
            });
            // I need to update the publication field once I retrieved all the publication informations from europepmc
            // Multiple promises delay problem
            // We need to use apply to pass an array of deferred objects to the when function
            $.when.apply(null, deferreds).done(function() {
                element.html(output);
            });
        });

        function getEuropePmcUrl(pubmed_id) {
            return "//www.ebi.ac.uk/europepmc/webservices/rest/search?query=ext_id:" + pubmed_id + "&format=JSON";
        }

        function getPublicationsWithId(id, publications) {
            var searchedResult = {};
            try {
                var allResults = publications.resultList.result;
                $.each(allResults, function(index, value) {
                    if (value.pmid === id) {
                        searchedResult = value;
                        return false;
                    }
                })
            } catch(err){
                console.error("Something went wrong while finding the publication using id", err);
            }
            return searchedResult;
        }

    }
})(jQuery);
