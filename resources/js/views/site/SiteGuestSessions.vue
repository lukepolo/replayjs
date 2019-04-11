<template>
  <div>
    <h3>Sessions</h3>
    <pre>{{ guest }}</pre>

    <div>
      <client-chat
        :is-agent="true"
        :channel="channel"
        :user-name="user.name"
      ></client-chat>
    </div>
    <div v-for="session in sessions">
      <router-link
        :to="{
          name: 'site.guest.session.components',
          params: { site: $route.params.site, session: session.hash },
        }"
      >
        <pre>{{ session.hash }}</pre>
      </router-link>
    </div>
  </div>
</template>

<script>
import ClientChat from "../../client/components/ClientChat";
export default {
  components: { ClientChat },
  $inject: ["BroadcastService"],
  created() {
    this.$store.dispatch("site/guest/show", {
      siteId: this.$route.params.site,
      guestId: this.$route.params.guest,
    });
    this.$store.dispatch("site/guest/session/get", {
      siteId: this.$route.params.site,
      guestId: this.$route.params.guest,
    });
  },
  data() {
    return {
      channel: null,
    };
  },
  watch: {
    guest: {
      immediate: true,
      handler(guest) {
        if (guest) {
          console.info(`chat.${guest.hash}`);
          this.channel = this.broadcastService.join(`chat.${guest.hash}`);
        }
      },
    },
  },
  computed: {
    guest() {
      return this.$store.state.site.guest.guest;
    },
    sessions() {
      return this.$store.state.site.guest.session.sessions;
    },
  },
};
</script>
