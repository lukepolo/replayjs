<template>
  <div>
    <session-player :session="session"></session-player>
    <h3>Network Requests</h3>
    <div v-if="session">
      <pre>{{ session.network_requests }}</pre>
    </div>
  </div>
</template>
<script>
import Vue from "vue";

import SessionPlayer from "./components/SessionPlayer";
export default Vue.extend({
  components: {
    SessionPlayer,
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("site/guest/show", {
          siteId: this.$route.params.site,
          guestId: this.$route.params.guest,
        });
        this.$store.dispatch("site/guest/session/show", {
          siteId: this.$route.params.site,
          guestId: this.$route.params.guest,
          sessionId: this.$route.params.session,
        });
      },
    },
  },
  computed: {
    session() {
      return this.$store.state.site.guest.session.session;
    },
  },
});
</script>
