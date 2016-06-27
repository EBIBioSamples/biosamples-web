(function(global) {

    const groupAccession = global.accession;
    const Vue = require('vue');
    const _ = require('lodash');
    const groupsamplesUrl = `http://localhost:8080/groupsamples/${groupAccession}`;
    Vue.use(require('vue-resource'));
    // Vue.component('group-samples', require('./components/productTable/ProductTable.vue'));


    const vm = new Vue({
        el: ".group_content__samples",
        data: {
            items: [],
            queryTerm: '',
            pageNumber: 1,
            pageSize: 10,
            sort: '',
            sortOrder: '',
            alerts: []
        },
        // props: {
        //     groupAccession: {
        //         type: String,
        //         required: true,
        //         validator: function(value) {
        //             return value.match(/SAMEG\d+/);
        //         }
        //     }
        // },
        ready() {
            this.getSamples();
        },

        methods: {
            getSamples(e) {
                console.log('Getting samples related to group');
                if (e !== undefined && typeof e.preventDefault() !== "undefined") {
                    e.preventDefault();
                }

                const queryParameters = this.getQueryParameters(this);
                const ajaxOptions = {
                    timeout: 20000
                };

                this.$http.get(groupsamplesUrl,queryParameters,ajaxOptions)
                    .then((results) => {
                        this.items = processResults(results);
                    })
                    .catch((data) => {
                        this.alerts.push({
                            type: 'danger',
                            timeout: 5000,
                            message: `Something went wrong!\nError code: ${data.status} - ${data.statusText}`
                        });
                    })
                    .then(() => {
                        console.log('Finished');
                    })

            },
            getQueryParameters() {
                return {
                        'page': 0,
                        'pagesize': 25,
                        'query': this.searchTerm,
                        'sortby': this.sort,
                        'sortorder': 'asc'
                }
            },
            sortBy(sortType) {
                console.log(`Sorted by ${sortType}`);
                this.sort = sortType;
                this.getSamples();
            }
        }
    });

    /* Support functions*/
    let processResults = function(results) {
        let items = [];
        for (let sample of results.data.content) {

            let accession = _.get(sample,'accession');
            let organism = _.get(sample,'characteristics.organism[0].text','');
            let name = _.get(sample, 'characteristics.sample_name[0].text','');
            let description = _.get(sample, 'description', '');
            let database = _.get(sample, 'externalReferences.Name','');

            items.push({
                accession,
                organism,
                name,
                description,
                database
            });
        }
        return items;
    }
})(window);