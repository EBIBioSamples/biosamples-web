/**
* Created by lucacherubin on 2016/07/18.
*/
<template>
    <div class="shield shield--{{variation}}">
        <span class="shield__key">{{key | externalReference | startCase}}</span><span class="shield__value" :style="{backgroundColor: valueColor}">{{{value}}}</span><span

            class="shield__close" v-if=closable @click="close">&times;</span>
    </div>
</template>

<script>
    const startCaseFilter = require("../../filters/startCaseFilter.js");

    function randomColor() {
        const hue = Math.floor(Math.random() * 360);
        const sat = 50 + Math.floor(Math.random() * 20);
        const lig = 30 + Math.floor(Math.random() * 20);
        return `hsl(${hue},${sat}%,${lig}%)`;
    }


    module.exports = {
        props: {
            key: {
                type: String,
                validator(value) {
                    console.log(value);
                    return true;
                }
            },
            value: {
                type: [String, Number],
                validator(value) {
                    console.log(value);
                    return true;
                }
            },
            closable: {
                type: Boolean,
                default: false
            },
            valueColor: {
                type: String,
                default: "#f27e3f",
                validator(value) {
                    //Alter the following conditions according to your need.
                    let stringToTest = value + "";
                    if (stringToTest === "") {
                        return false;
                    }
                    if (stringToTest === "inherit") {
                        return false;
                    }
                    if (stringToTest === "transparent") {
                        return false;
                    }
                    if (stringToTest === "random") {
                        return true;
                    }

                    var image = document.createElement("img");
                    image.style.color = "rgb(0, 0, 0)";
                    image.style.color = stringToTest;
                    if (image.style.color !== "rgb(0, 0, 0)") {
                        return true;
                    }
                    image.style.color = "rgb(255, 255, 255)";
                    image.style.color = stringToTest;
                    return image.style.color !== "rgb(255, 255, 255)";
                },
                coerce(value) {
                    if (value === "random") {
                        return randomColor();
                    }
                    return value;
                }
            },
            variation: {
                type: String,
                default: "flat",
                validator(value) {
                    console.log(value);
                    const stringToTest = (value + "").trim();
                    return ["plastic", "flat", "flat-squared"].indexOf(stringToTest) >= 0;
                }
            }
        },
        filters: startCaseFilter,
        methods: {
            close() {
                this.$emit("shield-closed");
            }
        }
    }
</script>