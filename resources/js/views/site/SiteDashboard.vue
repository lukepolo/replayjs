<template>
  <div v-if="site">
    <h3>Recordings for Site {{ site.domain }}</h3>
    <template v-if="recordings && recordings.length === 0">
      <h3>
        You haven't installed the script, or there have been no sessions to
        record.
      </h3>
    </template>
    <template v-else>
      <h3>Recordings</h3>
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
    </template>
    <code>
      <pre>{{ installScript }}</pre>
    </code>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("site/show", this.siteId);
        this.$store.dispatch("site/recording/get", this.siteId);
      },
    },
  },
  computed: {
    site() {
      return this.$store.state.site.site;
    },
    siteId() {
      return this.$route.params.site;
    },
    recordings() {
      return this.$store.state.site.recording.recordings;
    },
    installScript() {
      return `

      <script async src="${window.location.origin}/js/client.js"><\/script>
      <script>
        window.replayjsQueue = window.replayjsQueue || [];
        function replayjs(){replayjsQueue.push(arguments);}
        replayjs('auth', "${this.site.api_key}");
        replayjs('stream');
      <\/script>
      `;
    },
  },
});
</script>
