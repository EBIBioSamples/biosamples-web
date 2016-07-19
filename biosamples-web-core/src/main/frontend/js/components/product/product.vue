<template>
    <div class="biosample-result panel panel-default">
        <div class="panel-heading">
            <span class="h3"><a :href="itemPage">{{title}}</a></span>
            <span class="label label-success">{{type}}</span>
            <span class="label label-info">{{subtitle}}</span>
            <div class="badge-container">
                <shield v-for="(key, value) in badges"
                        :key="key"
                        :value="value">
                </shield>
            </div>
        </div>
        <div class="panel-body" v-html="description | excerpt"></div>
        <div class="panel-footer">
            <span class="small">Last update date: <span v-text="date | solrDate"></span></span>
        </div>
    </div>
</template>

<script>
    module.exports = {
        data() {
          return {
              badges: {
                  content_type: "sample",
                  organism: "Homo sapiens"
              }
          }
        },

        components: {
            "shield": require("../shield/shield.vue")
        },

        props: {
            title: String,
            type: String,
            subtitle: String,
            content: String,
            date: String
//            badges: [Array,Object]
        }
    };
</script>