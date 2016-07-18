/**
* Created by lucacherubin on 2016/07/18.
*/
<template>
 <div class="shield shield--{{variation}}">
  <span class="shield__key">{{key}}</span><span class="shield__value" :style="{backgroundColor: valueColor}">{{value}}</span><span class="shield__close" v-if=closable @click="close">x</span>
 </div>
</template>

<script>
 module.exports = {
  props: {
   key: String,
   value: String,
   closable: {
    type: Boolean,
    default: false
   },
   valueColor: {
    type: String,
    default: "orange",
    validator: function(value) {
     //Alter the following conditions according to your need.
     let stringToTest = value + "";
     if (stringToTest === "") { return false; }
     if (stringToTest === "inherit") { return false; }
     if (stringToTest === "transparent") { return false; }

     var image = document.createElement("img");
     image.style.color = "rgb(0, 0, 0)";
     image.style.color = stringToTest;
     if (image.style.color !== "rgb(0, 0, 0)") { return true; }
     image.style.color = "rgb(255, 255, 255)";
     image.style.color = stringToTest;
     return image.style.color !== "rgb(255, 255, 255)";
    }
   },
   variation: {
    type: String,
    default: "flat",
    validator: function(value) {
     console.log(value);
     const stringToTest = (value + "").trim();
     return ["plastic","flat","flat-squared"].indexOf(stringToTest) >= 0;
    }
   }
  },
  methods: {
   close() {
    this.$emit("shield-closed");
   }
  }
 }
</script>