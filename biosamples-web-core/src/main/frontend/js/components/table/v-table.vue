<template>
    <table :class="tableClasses">
        <thead>
            <tr>
                <th v-for="column in columns">{{column | headFilter}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in data">
                <td v-for="column in columns">
                    {{{valueFunction(row,column) | dataFilter}}}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="es6">

    const _ = require("lodash");
    const Store = require("../Store.js");
    const olsSearchLink = "http://www.ebi.ac.uk/ols/beta/search?start=0&groupField=iri&exact=on&q=";

    const accessionRegExp = "(?:SAM[NE]A?\\d+|SAMEG\\d+)";
    const accessionInHref = `http(s)?:\/{2}.+(?:SAM[NE]A?\\d+|SAMEG\\d+)"${accessionRegExp}`;


    function matchAccession(value) {
        return value.match(RegExp(accessionRegExp));
    }

    function matchAccessionInLink(value) {
        return value.match(RegExp(accessionInHref));
    }

    function renderAccession(value) {
        let type = "samples";
        if (value.match(/^SAMEG\d+/)) {
            type = "groups";
        }
        let link = `${Store.getInstance().baseUrl}${type}/${value}`;
        return `<a href='${link}'>${value}</a>`;
    }

    function renderLink(value) {
        let anchorRegexp = /(<a.*>.*<\/a>)/;
        let linkRegexp = /(https?:\/\/\S+)/;
        let strAnchors = value.split(anchorRegexp);
        let finalValue = '';
        for (let sub of strAnchors) {
            if (!sub.match(anchorRegexp)) {
                sub = sub.replace(linkRegexp,"<a href='$1'>$1</a>");
            }
            finalValue = finalValue + sub;
        }

        return finalValue;
    }

    function renderOntologyTerm(jsonValue) {
        let textValue = jsonValue.text;
        let ontology_terms = jsonValue['ontology_terms'];
        if (ontology_terms[0]) { // build the OLS link for the ontology mapped value
            let link = olsSearchLink + encodeURIComponent(ontology_terms[0]);
            return `<a href=${link} target='_blank'>${textValue}</a>`
        } else { //something wrong happened
            console.log("Something went wrong - ontology_terms collection present but no first element?");
        }
    }

    module.exports = {
        props: {
            columns: {
                type: Array
            },

            data: {
                type: Array
            },

            valueFunction: {
                type: Function
            },

            dataShow: {
                type: Function
            },

            tableClasses: {
                type: Array,
                default: []
            }
        },

        filters: {
            headFilter(value) {
                switch(value) {
                    case "external_references_url":
                        return "Link";
                    default:
                        return value.split("_").map(function (value) {
                            return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
                        }).join(" ");
                }
            },

            /*
            this function render the values inside the table.
             */
            dataFilter(value, separator = ", ") {
                try { // necessary to handle null values

                    //Check if multiple value is present
                    let valArray = value.split(separator);
                    let mapArray = valArray.map(value => {
                        try { // check if value has ontology associated
                            let jsonValue = JSON.parse(value);
                            if (jsonValue.hasOwnProperty('ontology_terms')) {
                                return renderOntologyTerm(jsonValue);
                            }
                            return jsonValue;
                        } catch (e) {
                            if (value) { // value is not a json object
                                // Other value rendering functions
                                if (matchAccession(value)) {
                                    return renderAccession(value);
                                }
                                if (value.match(/https?:\/\//)) {
                                    return renderLink(value);
                                }
                            }
                            return value;
                        }
                    });
                    return mapArray.slice(1).reduce((complete, part) => `${complete}${separator}${part}`, mapArray[0]);
                } catch (e) {
                    return value;
                }
            }
        }
    }
</script>