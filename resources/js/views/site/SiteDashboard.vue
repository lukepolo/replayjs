<template>
  <div>
    <template v-if="guests && guests.length === 0">
      <h3>
        You haven't installed the script, or there hasn't been any recorded
        sessions.
      </h3>
      <install-script :site="site"></install-script>
    </template>
    <template v-else>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>IP Address</th>
            <th>Session Time</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="guest in guests">
            <tr>
              <td>
                <router-link
                  :to="{ name: 'site.guest', params: { guest: guest.hash } }"
                  >{{ guest.name }}</router-link
                >
              </td>
              <td>
                {{ guest.ip_address }}
              </td>
              <td>
                {{ guest.created_at }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import InstallScript from "@views/site/components/InstallScript";

// TODO - implement
// chat-message
// mark-chat-message-as-read

export default Vue.extend({
  components: { InstallScript },
  watch: {
    $route: {
      immediate: true,
      handler() {
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
  },
});
</script>
