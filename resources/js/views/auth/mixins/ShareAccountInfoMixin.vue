<script>
import Vue from "vue";
export default Vue.extend({
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.form.reset();
        let { email, password } = this.authAreaData;
        this.$set(this.form, "email", email);
        this.$set(this.form, "password", password);
      },
    },
    "form.email"(value) {
      this.$store.commit("auth/UPDATE_AUTH_AREA_DATA", {
        email: value,
      });
    },
    "form.password"(value) {
      this.$store.commit("auth/UPDATE_AUTH_AREA_DATA", {
        password: value,
      });
    },
  },
  computed: {
    authAreaData() {
      return this.$store.state.auth.authAreaData;
    },
  },
});
</script>
