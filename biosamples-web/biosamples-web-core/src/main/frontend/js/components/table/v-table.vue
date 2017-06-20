<template>
    <table :class="tableClasses">
        <thead>
            <tr>
                <th v-for="column in columns">{{column | headFilter}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in data">
                <td v-for="column in columns" v-html="valueFunction(row, column) | dataFilter"></td>
            </tr>
        </tbody>
    </table>
</template>

<script>

    const Store =  window.Store;
    const startCaseFilter = require('../../filters/startCaseFilter.js');
//    const _ = require('lodash');
//    const olsSearchLink = 'http://www.ebi.ac.uk/ols/beta/search?start=0&groupField=iri&exact=on&q=';

    function isAccession(value) {
        return value.match(/(?:SAM(N|E|)A?\d+|SAMEG\d+)/);
    }

    function isLink(value) {
        return value.match(/https?:\/\//);
    }

    function renderAccession(value) {

        let link = value.match(/^SAMEG\d+/) ?
            `${Store.groupsUrl}/${value}` :
            `${Store.samplesUrl}/${value}`;

        return `<a href='${link}'>${value}</a>`;
    }

    function renderLink(value) {
        let anchorRegexp = /(<a.*>.*<\/a>)/;
        let linkRegexp = /(https?:\/\/\S+)/;
        let strAnchors = value.split(anchorRegexp);
        let finalValue = '';
        for (let sub of strAnchors) {
            if (!sub.match(anchorRegexp)) {
                sub = sub.replace(linkRegexp,'<a href="$1">$1</a>');
            }
            finalValue = finalValue + sub;
        }

        return finalValue;
    }

    function renderOntologyTerm(jsonValue) {
        let textValue = jsonValue.text;
        return textValue;
//        let ontologyTerms = jsonValue['ontologyTerms'];
//        if (ontologyTerms[0]) { // build the OLS link for the ontology mapped value
//            let link = olsSearchLink + encodeURIComponent(ontologyTerms[0]);
//            return `<a href=${link} target='_blank'>${textValue}</a>`
//        } else { //something wrong happened
//            console.log("Something went wrong - ontologyTerms collection present but no first element?");
//        }
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
                return startCaseFilter(value);

            },

            /*
            this function render the values inside the table.
             */
            dataFilter(value) {
                try { // necessary to handle null values

                    //Check if multiple value is present
                    let mapArray = value.map(value => {
                        if (value.hasOwnProperty('ontologyTerms')) {
                            return renderOntologyTerm(value);
                        } else {
                            let textValue = value.hasOwnProperty('text') ? value.text : value;
                            if (isAccession(textValue)) {
                                return renderAccession(textValue);
                            } else if (isLink(textValue)) {
                                return renderLink(textValue);
                            } else {
                                return textValue;
                            }

                        }
                    });
                    return mapArray.slice(1).reduce((complete, part) => `${complete}, ${part}`, mapArray[0]);
                } catch (e) {
                    return value;
                }
            }
        }
    };
</script>