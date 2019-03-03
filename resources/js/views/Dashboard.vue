<template>
  <div>
    <h3>Dashboard</h3>
    <h3>Sites</h3>
    <div>Create Site</div>
    <form v-form="siteForm" @submit.prevent="createSite">
      <input type="text" name="domain" v-model="siteForm.domain" validate />
      <button type="submit" :disabled="!siteForm.isValid()">Create Site</button>
    </form>

    <div v-for="site in sites">
      <router-link
        :to="{ name: 'site.dashboard', params: { site: site.id } }"
        >{{ site.domain }}</router-link
      >
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      siteForm: this.createForm({
        domain: null,
      }).validation({
        rules: {
          domain: "required|domain",
        },
      }),
    };
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("site/get");
      },
    },
  },
  methods: {
    createSite() {
      this.$store.dispatch("site/create", this.siteForm.data()).then((site) => {
        this.$router.next({
          name: "site.dashboard",
          params: {
            site: site.id,
          },
        });
      });
    },
  },
  computed: {
    sites() {
      return this.$store.state.site.sites;
    },
  },
});
</script>
