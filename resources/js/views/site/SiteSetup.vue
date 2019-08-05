<template>
  <div>
    <install-script :site="site"></install-script>
  </div>
</template>
<script>
import Vue from "vue";
import InstallScript from "@views/site/components/InstallScript";
export default Vue.extend({
  components: { InstallScript },
  computed: {
    site() {
      return this.$store.state.site.site;
    },
  },
});
</script>
