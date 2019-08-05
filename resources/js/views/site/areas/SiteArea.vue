<template>
  <div class="site-area" v-if="site">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("site/show", this.$route.params.site);
      },
    },
  },
  computed: {
    site() {
      return this.$store.state.site.site;
    },
  },
};
</script>
