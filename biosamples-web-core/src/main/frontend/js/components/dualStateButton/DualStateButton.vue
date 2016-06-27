<template>
    <button @click="next">{{currentValue}}</button>
</template>

<script>

    let checkState = function() {

    };


    export default {
        data() {
            return {
                stateIndex: -1
            }
        },

        computed: {
            currentState() {

                if (this.hasStates() ) {
                   if (this.stateIndex >= 0 && this.stateIndex < this.states.length) {
                       return this.states[this.stateIndex];
                   }
                }
                return "";
            },

            hasStates() {
                return this.states.length > 0;
            }
        },

        prop: {
            states: {
                type: Array,
                default: []
            }
        },

        methods: {
            nextState() {
                if (this.hasStates()) {
                    this.stateIndex = this.stateIndex >= this.nStates() ? 0 : this.stateIndex++;
                }
            },
            previousState() {
                if (this.hasStates()) {
                    this.stateIndex = this.stateIndex == 0 ? this.nStates() - 1 : this.stateIndex--;
                }

            }
        }
    }
</script>