<style>
</style>

<template>
    <div v-bind:class="alertClasses" role="alert" v-show="show" class="animated" transition="flash">
        <h5>{{type | capitalize}}!</h5>
        <slot>This is the alert content</slot>
        <button v-bind:class="alertCloseClasses" v-on:click="closeAlert">&times;</button>
    </div>
</template>

<script>
    module.exports = {

        props: {
            type: {default: 'info'},
            timeout: {default: 3000}
        },

        data() {
            return {
                show: true,
                timer: {}
            }
        },

        computed: {
            alertClasses: function() {
                let type = this.type;
                return {
                    "alert": true,
                    "alert-success": type === "success",
                    "alert-info": type === "info",
                    "alert-warning": type === "warning",
                    "alert-danger": type === "danger"
                }
            },
            alertCloseClasses: function() {
                let type = this.type;
                return {
                    "alert__close": true,
                    "btn": true,
                    "btn-success": type === "success",
                    "btn-info": type === "info",
                    "btn-warning": type === "warning",
                    "btn-danger": type === "danger"
                }
            }
        },

        ready() { this.timer = setTimeout( () => this.closeAlert(), this.timeout) },

        methods: {
            closeAlert() {
//                this.show = false;
                clearTimeout(this.timer);
                this.$emit("alert-closed",this);
            }

        }


    }
</script>