<template>
  <div>
    <router-link :to="{ name: 'preview' }">Preview</router-link>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  mounted() {
    let client = document.createElement("script");
    client.src = "http://replayjs.test:3000/js/client.js";
    this.$el.append(client);
  },
});
</script>
