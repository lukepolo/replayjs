<template>
  <div>
    <h3>Guest</h3>
    <pre>{{ guest }}</pre>

    <h3>Chat</h3>
    <div>
      <client-chat
        :user-data="user"
        :is-agent="true"
        :channel="channel"
        :previous-messages="previousMessages"
      ></client-chat>
    </div>

    <h3>Sessions</h3>
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

    this.$store
      .dispatch("site/guest/chat/get", {
        siteId: this.$route.params.site,
        guestId: this.$route.params.guest,
      })
      .then((data) => {
        this.previousMessages = data.messages;
      });
  },
  data() {
    return {
      channel: null,
      previousMessages: null,
    };
  },
  watch: {
    guest: {
      immediate: true,
      handler(guest) {
        if (guest) {
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
