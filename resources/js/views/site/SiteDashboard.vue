<template>
  <div>
    <h3>Recordings for Site</h3>
    <div v-for="recording in recordings">
      <router-link
        :to="{
          name: 'site.recordings.player',
          params: { site: $route.params.site, recording: recording.id },
        }"
      >
        {{ recording.session }}
      </router-link>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("site/recording/get", this.siteId);
      },
    },
  },
  computed: {
    siteId() {
      return this.$route.params.site;
    },
    recordings() {
      return this.$store.state.site.recording.recordings;
    },
  },
});
</script>
