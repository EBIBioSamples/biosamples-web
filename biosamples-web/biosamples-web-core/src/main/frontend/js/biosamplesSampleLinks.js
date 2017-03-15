(function($){
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    const axios         = require("axios");
    const olsSearchLink = "//www.ebi.ac.uk/ols/terms?iri=";
    const olsApiSearchLink = "//www.ebi.ac.uk/ols/api/terms?iri=";

    $(document).ready(function() {
        try {
            initializeLinks();
        } catch (e) {
            console.log(e);
        }
        normalizeCrtNames();
    });

    function normalizeCrtNames() {
        console.log("Normalizing characteristic names");
        $(".col_title").each(function() {
            // Split this in a recursive call to avoid the update of inner tags attributes
            let capitalizeFirstLetter = true;
            normalizeField(this, capitalizeFirstLetter);
        })
    }

    function normalizeField(field, capitalizeFirstLetter) {
        let $field = $(field);
        if ($field.children().length > 0) {
            $(field).children().each(function () {
                normalizeField(this, capitalizeFirstLetter);
            })
        } else {
            $field[0].textContent = camelCaseSplit($field[0].textContent, capitalizeFirstLetter);
        }
    }

    function camelCaseSplit(value, capitalizeFirstLetter) {
        let camelCaseSplitRegex = /(([a-z])(?=[A-Z])|([A-Z])(?=[A-Z][a-z]))/g;
        let camelCaseSplitSub = '$1 ';
        let newString = value.replace(camelCaseSplitRegex,camelCaseSplitSub);
        newString = newString.toLowerCase();
        if (! capitalizeFirstLetter ) {
            return newString;
        }
        return newString.charAt(0).toUpperCase() + newString.substring(1);
    }

    function renderField(fieldValue) {
        let dfd = $.Deferred();

        if (isALink(fieldValue.text)) {
            console.log("No ontology term for '" + fieldValue.text + "'");
            dfd.resolve("<a href=\"" + fieldValue.text + "\" target=\"_blank\">" + fieldValue.text + "</a>")
        } else if (fieldValue.ontologyTerms) {
            console.log("Found ontology term for '" + fieldValue.text + "': " + fieldValue.ontologyTerms);
            if (fieldValue.ontologyTerms[0]) {
                let iri = fieldValue.ontologyTerms[0];
                $.when(checkInOls(iri)).done( function(iri) {
                    let link = olsSearchLink + encodeURIComponent(iri);
                    if (fieldValue.unit) {
                        dfd.resolve(fieldValue.text + "( <a href=\"" + link + "\" target='_blank'>" + fieldValue.unit + "</a> )");
                    } else {
                        dfd.resolve("<a href=\"" + link + "\" target='_blank'>" + fieldValue.text + "</a>");
                    }
                }).fail(function() {
                    dfd.resolve("<a href=\"" + iri + "\" target='_blank'>" + fieldValue.text + "</a>");
                });
            }
            else {
                console.log("Something went wrong - ontologyTerms collection present but no first element?");
                dfd.reject("Something went wrong - ontologyTerms collection present but no first element?")
            }
        } else if (fieldValue.unit) {
            console.log("No ontology term for '" + fieldValue.text + "'");
            dfd.resolve(fieldValue.text + " (" + fieldValue.unit + ")");
        } else {
            console.log("No ontology term for '" + fieldValue.text + "'");
            dfd.resolve(fieldValue.text);
        }
        return dfd.promise();
    }

    function initializeLinks() {
        console.log("Checking characteristic-mappings");
        $(".characteristic-mapping").each(function(){
            // get JSON payload for each element
            let mapping = $(this);
            let mappingChildren = mapping.children(".characteristic-mapping-payload");
            if (mappingChildren.length > 0) {
                mappingChildren.each(function () {
                    let quotedPayload = $(this).html();
                    let jsonStr;
                    if (quotedPayload.charAt(0) === '"' && quotedPayload.charAt(str.length - 1) === '"') {
                        jsonStr = quotedPayload.substr(1, str.length - 2);
                    }
                    else {
                        jsonStr = quotedPayload;
                    }
                    if (jsonStr && jsonStr.trim().length > 0) {
                        try {
                            let json = jQuery.parseJSON(jsonStr);
                            if (json instanceof Array) {
                                mapping.text("Loading...");
                                let finalMapping = "";
                                let deferreds = [];
                                $.each(json, function (index, el) {
                                    deferreds.push($.when(renderField(el)).done(function(value) {
                                        finalMapping = `${finalMapping}${value}, `;
                                    }));
                                });
                                $.when.apply(null, deferreds).done(function() {
                                    finalMapping = finalMapping.substring(0, finalMapping.length - 2);
                                    mapping.html(finalMapping);
                                });

                            } else {
                                mapping.text(json.text);
                                $.when(renderField(json)).then(function(value) {
                                    mapping.html(value);
                                }, function(error) {
                                    console.log(error);
                                });
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            } else {
                let originalText = mapping.text();
                let expandedText = findAndUpdateLinks(originalText);
                mapping.html(expandedText);
            }
        });

        console.log("Checking external-references-payload");

        $(".external-references-payload").each(function(){
            // get JSON payload
            let quotedPayload = $(this).html();
            let mapping = $(this);
            let jsonStr;
            if (quotedPayload.charAt(0) === '"' && quotedPayload.charAt(str.length -1) === '"'){
                jsonStr = quotedPayload.substr(1, str.length-2);
            }
            else {
                jsonStr = quotedPayload;
            }
            let json = jQuery.parseJSON(jsonStr);
            let output = "";
            $.each( json, function( index, value ) {
                if (value.URL.indexOf("/ena/") > -1) {
                    output = `${output}<a href="${value.URL}" target="_blank">${value.Acc}<img style="height: 1em; padding-left: 5px;" src="../images/ena_logo.png"/></a>`;
                } else if (value.URL.indexOf("/arrayexpress/") > -1) {
                    output = `${output}<a href="${value.URL}" target="_blank">${value.Acc}<img style="height: 1em; padding-left: 5px" src="../images/arrayexpress_logo.png"/></a>`;
                } else if (value.URL.indexOf("/pride/") > -1) {
                    output = `${output}<a href="${value.URL}" target="_blank">${value.Acc}<img style="height: 1em; padding-left: 5px" src="../images/pride_logo.png"/></a>`;
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

            let element = $(this);
            let rawString = element.html();
            let json = $.parseJSON(rawString);
            let output = "";
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

            let element = $(this);
            let rawString = element.html();
            let json = $.parseJSON(rawString);
            let output = "";
            $.each( json, function(index,value) {
                output += value.Name;
                if (index < json.length - 1) {
                    output += "<br/>";
                }
            });
            element.html(output);
        });

        $('.publications-field-content').each(function(){

            let element = $(this);
            let rawString = element.html();
            let json = $.parseJSON(rawString);
            let output = "";
            let deferreds = [];
            $.each( json, function(index,value) {
                let apiUrl = getEuropePmcUrl(value.pubmed_id);
                if (apiUrl) {
                    deferreds.push($.get(apiUrl).success(function (data) {
                        let pub = getPublicationsWithId(value.pubmed_id, data);
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
                }
            });
            // I need to update the publication field once I retrieved all the publication informations from europepmc
            // Multiple promises delay problem
            // We need to use apply to pass an array of deferred objects to the when function
            $.when.apply(null, deferreds).done(function() {
                element.html(output);
            });
        });

        function getEuropePmcUrl(pubmed_id) {
            if (pubmed_id) {
                return "//www.ebi.ac.uk/europepmc/webservices/rest/search?query=ext_id:" + pubmed_id + "&format=JSON";
            } else {
                return pubmed_id;
            }
        }

        function getPublicationsWithId(id, publications) {
            let searchedResult = {};
            try {
                let allResults = publications.resultList.result;
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

    function findAndUpdateLinks(value) {
        if (value) {
            let words = value.split(" ");
            let expandedWords = words.map(el => {
                if (isALink(el)) {
                    return "<a href=\"" + el + "\" target=\"_blank\">" + el + "</a>";
                }
                return el;
            });
            return expandedWords.join(" ");
        } else {
            return value;
        }

    }

    function isALink(value) {
        if (value) {
            const possibleLinks = ["ftp://", "http://", "https://"];
            return possibleLinks.filter(el => value.startsWith(el)).length > 0;
        } else {
            return false;
        }
    }

    function isJSON(value) {
        if (typeof value !== "string") {
            return false;
        }

        try {
            let parsed = JSON.parse(value);
            if (parsed) return true;
        } catch (err) {
            console.debug("Passed value is not a JSON string");
        }
        return false;
    }

    function checkInOls(iri) {
        let checkUrl = olsApiSearchLink + iri;
        let dfd = $.Deferred();
        $.ajax({
            url: checkUrl,
            success: function(response, status) {
                if (status === "success" && response.hasOwnProperty("_embedded")) {
                    dfd.resolve(iri);
                } else {
                    dfd.reject()
                }
            },
            error: function(value)  { dfd.reject(value) }
        });
        return dfd.promise();

        // return response.status == 200 && response.responseJSON.hasOwnProperty("_embedded");
    }

})(jQuery);
