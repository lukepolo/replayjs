<template>
  <div v-if="site">
    <h3>Guests for Site {{ site.domain }}</h3>
    <template v-if="guests && guests.length === 0">
      <h3>
        You haven't installed the script, or there hasn't been any recorded
        sessions.
      </h3>
    </template>
    <template v-else>
      <template v-for="guest in guests">
        <router-link :to="{ name: 'site.guest', params: { guest: guest.id } }"
          >{{ guest.name }} {{ guest.ip_address }}</router-link
        >
      </template>
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
        this.$store.dispatch("site/guest/get", this.siteId);
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
    guests() {
      return this.$store.state.site.guest.guests;
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
