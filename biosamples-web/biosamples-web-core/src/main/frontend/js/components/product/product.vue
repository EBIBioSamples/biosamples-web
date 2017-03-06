<template>
    <div class="biosample-result panel panel-default">
        <div class="panel-heading">
            <div class="panel-title" style="display: flex; align-items: baseline">
                <span class="label" :class="labelClass">{{object.type}}</span>
                <span class="h4">
                    <a :href="object.link">{{object.title}}</a>
                </span>
                <span>Updated: {{object.date | solrDate}} </span>
            </div>
            <div>
                <span class="h4" v-if="object.subtitle">{{object.subtitle}}</span>
            </div>
            <!--<span class="label label-info">{{object.subtitle}}</span>-->
            <div class="badge-container">
                    <shield v-for="badge in badgeArray"
                            :key="badge.key | characteristic"
                            :value="badge.value">
                    </shield>
            </div>
        </div>
        <div class="panel-body" v-if="object.description">{{object.description | excerpt}}</div>
        <!--<div class="panel-footer">-->
            <!--<span class="small">Last update date: {{product.date | solrDate}}</span>-->
        <!--</div>-->
    </div>
</template>

<script>
    const startCaseFilter = require("../../filters/startCaseFilter.js");

    function castArray() {
        if (!arguments.length) {
            return [];
        }
        var value = arguments[0];
        return Array.isArray(value) ? value : [value];
    }

    module.exports = {

        data() {
            return {
                maxBadgeLength: -1
            }
        },

        components: {
            "shield": require("../shield/shield.vue")
        },
        computed: {
           object() { return this.displayFunction(this.content) },
           badgeArray() {
               // Create the badge array checking for multivalued fields
               let badges = this.object.badges;
               let all = [];
               for(let key of Object.keys(badges)) {
                    let badgeValues = castArray(badges[key]);
                    for (let val of badgeValues ) {
                        if (this.maxBadgeLength < 0 || val.length + key.length < this.maxBadgeLength) {
                            all.push({"key": key, "value": val});
                        }
                    }
               }
               return all;
           },
            isSample() {
                return this.object.type === 'sample'
            },
            labelClass() {
                return this.isSample ? 'label-success' : 'label-warning'
            }

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