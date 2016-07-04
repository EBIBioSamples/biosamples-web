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
                return value.split("_").map(function(value){
                    return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
                }).join(" ");
            },

            dataFilter(value) {
                try {
                    let jsonValue = JSON.parse(value);
                    if (jsonValue.hasOwnProperty('ontology_terms')) {
                        let textValue = jsonValue.text;
                        let ontology_terms = jsonValue['ontology_terms'];
                        if (ontology_terms[0]) {
                            let link = olsSearchLink + encodeURIComponent(ontology_terms[0]);
                            return `<a href=${link} target='_blank'>${textValue}</a>`
                        } else {
                            console.log("Something went wrong - ontology_terms collection present but no first element?");
                        }
                    }
                } catch (e) {
                    if (value) {
                        if (value.match(/(?:SAM(N|E|)A?\d+|SAMEG\d+)/)) {
                            return renderAccession(value);
                        }

                        if (value.match(/https?:\/\//)) {
                            return renderLink(value);
                        }
                    }
                    return value;
                }
            }
        }
    }
</script>