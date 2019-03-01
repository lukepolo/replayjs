<template>
  <div>
    <router-link :to="{ name: 'preview' }">Preview</router-link>

    <div v-for="recording in recordings">
      <router-link
        :to="{ name: 'recordings.player', params: { recording: recording.id } }"
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
        this.$store.dispatch("recording/get");
      },
    },
  },
  computed: {
    recordings() {
      return this.$store.state.recording.recordings;
    },
  },
});
</script>
