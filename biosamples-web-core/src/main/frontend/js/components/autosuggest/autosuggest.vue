// A port of the vue-typeahead component at https://github.com/pespantelis/vue-typeahead
<template>
    <input class="as__input--main" type="text" autocomplete="off" :name="inputName" placeholder="Start your search"
           v-model="searchTerm"
           @input="update"
           @keydown.down.prevent="down"
           @keydown.up.prevent="up"
           @keydown.right="fill"
           @keydown.enter="hit"
           @keydown.esc="reset"
           @blur="reset"
    />
    <ul class="as__items" v-show="items.length > 0" v-if="!debugConditions">
        <li v-for="item of items" track-by="$index" :class="activeClass($index)" @mousedown="hit" @mousemove="setActive($index)">{{item}}</li>
    </ul>
    <ul class="as__items" v-if="debugConditions">
        <li>Item-1</li>
        <li class="active">Item-2</li>
        <li>Item-3</li>
        <li>Item-4</li>
        <li>Item-5</li>
    </ul>
</template>

<script lang="es6">

    module.exports = {

        props: [
            "searchTerm",
            "name",
            "queryParamName",
            "limit",
            "minChars",
            "src",
            "debug"
        ],

        data() {
            return {
                items: [],
                current: -1,
                loading: false,
                selectFirst: false
            }
        },

        computed: {
            hasItems() {
                return this.items.length > 0;
            },
            isEmpty() {
                return !this.searchTerm;
            },
            debugConditions() {
                return this.debug && !this.hasItems;
            },
            inputName() {
                return this.name ? this.name : "search";
            }
        },
        methods: {
            update () {
                if (!this.searchTerm) {
                    return this.reset();
                }

                if (this.minChars && this.searchTerm.length < this.minChars) {
                    return;
                }

                console.log(`Requesting for suggested terms for ${this.searchTerm}`);

                this.loading = true;

                this.fetch().then((response) => {
                    if (this.searchTerm) {
                        let docs = response.json().response.docs;
                        let tempResults = docs.map(el => el.autosuggest_term_label);
                        this.items = this.limit ? tempResults.slice(0, this.limit) : tempResults;
                        this.current = -1;
                        this.loading = false;
                        if (this.selectFirst) {
                            this.down();
                        }
                    }
                })
            },

            fetch () {
                if (!this.src) {
                    return console.warn('You need to set the `src` property', this);
                }

                const params = this.queryParamName ?
                {[this.queryParamName]: this.searchTerm} : {"term": this.searchTerm};

                return this.$http.get(this.src, {params});
            },

            reset () {
                this.items = [];
                this.loading = false;
            },

            setActive (index) {
                this.current = index;
            },

            activeClass (index) {
                return {
                    active: this.current === index
                }
            },

            hit () {
                if (this.current !== -1) {
                    this.onHit(this.items[this.current]);
                }
            },

            fill() {
                if (this.hasItems && this.current !== -1) {
                    this.searchTerm = this.items[this.current];
                }
            },

            up () {
                if (this.current > 0) {
                    this.current--;
                } else if (this.current === -1) {
                    this.current = this.items.length - 1;
                } else {
                    this.current = -1;
                }
            },

            down () {
                if (this.items.length ==0) {
                    update();
                }
                if (this.current < this.items.length - 1) {
                    this.current++;
                } else {
                    this.current = -1;
                }
            },

            onHit(value) {
                this.searchTerm = value;
                this.reset();
            }

        }
    }

</script>