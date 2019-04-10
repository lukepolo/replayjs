<template>
  <div>
    <h3>Sessions</h3>
    <pre>{{ guest }}</pre>
    <div v-for="session in sessions">
      <router-link
        :to="{
          name: 'site.guest.session.components',
          params: { site: $route.params.site, session: session.session },
        }"
      >
        <pre>{{ session.session }}</pre>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
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

    this.channel = this.broadcastService
      .join(`chat.E529yqvVrNZ0k3JPE9PQBKgxbWdXOjw4`)
      .here(() => {
        console.info("joined!");
      })
      .listenForWhisper("chat-message", (data) => {
        console.info(data);
      });
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
