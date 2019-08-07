<template>
  <nav class="nav">
    <div v-if="sites">
      <dropdown :options="options" @select="changeSite">
        <template v-if="selectedSite">
          {{ selectedSite.domain }}
        </template>
      </dropdown>
    </div>
    <template v-if="selectedSite">
      <ul>
        <li>
          <router-link
            :to="{ name: 'site.dashboard', params: { site: selectedSite.id } }"
            >Dashboard</router-link
          >
        </li>
      </ul>

      <h3>Sessions</h3>
      <ul>
        <li>
          <router-link to="/" exact>Active</router-link>
        </li>
        <li>
          <router-link to="/" exact>Recent</router-link>
        </li>
        <li>
          <router-link to="/" exact>New</router-link>
        </li>
      </ul>

      <h3>Settings</h3>
      <ul>
        <li>
          <router-link
            :to="{ name: 'site.setup', params: { site: selectedSite.id } }"
            exact
            >Setup</router-link
          >
        </li>
        <li>
          <router-link to="/" exact>Intergrations</router-link>
        </li>
      </ul>
    </template>

    <template>
      bottom
      <div>
        <router-link to="/" exact>Help</router-link>
      </div>
      <div>
        <router-link to="/" exact>Documentation</router-link>
      </div>
      <div>
        <router-link to="/" exact>{{ user.email }}</router-link>
      </div>
    </template>
  </nav>
</template>

<script>
export default {
  methods: {
    changeSite(site) {
      this.$store.commit("site/SET_SELECTED_SITE", site);
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("site/get");
      },
    },
  },
  computed: {
    options() {
      return this.sites.map((site) => {
        return {
          value: site,
          display: site.domain,
        };
      });
    },
    sites() {
      return this.$store.state.site.sites || [];
    },
    selectedSite() {
      return this.$store.state.site.selectedSite;
    },
  },
};
</script>
