<template>
    <div class="biosample-result panel panel-default">
        <div class="panel-heading">
            <span class="h3"><a :href="product.link">{{product.title}}</a></span>
            <span class="label label-success">{{product.type}}</span>
            <span class="label label-info">{{product.subtitle}}</span>
            <div class="badge-container">
                <shield v-for="(key, value) in product.badges"
                        :key="key | characteristic"
                        :value="value">
                </shield>
            </div>
        </div>
        <div class="panel-body">{{product.description | excerpt}}</div>
        <div class="panel-footer">
            <span class="small">Last update date: {{product.date | solrDate}}</span>
        </div>
    </div>
</template>

<script>
    const startCaseFilter = require("../../filters/startCaseFilter.js");

    module.exports = {

        components: {
            "shield": require("../shield/shield.vue")
        },
        computed: {
           product() { return this.displayFunction(this.content) }
        },

        props: {
            content: Object,
            displayFunction: {
                type: Function,
                default: function(obj) {
                    return {
                        title: obj.title,
                        subtitle: obj.subtitle,
                        type: obj.type,
                        badges: obj.badges,
                        description: obj.description,
                        date: obj.date
                    }
                }
            }
        },

        filters: {
            characteristic(value) {
                return startCaseFilter(value.replace(/_crt$/,""))
            }
        }
    };
</script>