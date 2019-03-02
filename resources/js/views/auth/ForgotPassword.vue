<template>
  <div>
    <h1>Forgot Password</h1>
    <router-link :to="{ name: 'login' }">Or Login</router-link>

    <form v-form="form" @submit.prevent="requestResetPassword">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          v-model="form.email"
          validate
        />
      </div>

      <div class="form-group">
        <button class="btn btn--blue" type="submit" :disabled="!form.isValid()">
          Reset Password
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import Vue from "vue";
import ShareAccountInfoMixin from "./mixins/ShareAccountInfoMixin";

export default Vue.extend({
  mixins: [ShareAccountInfoMixin],
  data() {
    return {
      form: this.createForm({
        email: null,
      }).validation({
        rules: {
          email: "required|email",
        },
      }),
    };
  },
  methods: {
    requestResetPassword() {
      this.$store.dispatch("auth/forgotPasswordRequest", this.form).then(
        () => {
          this.form.reset();
          this.$router.push({
            name: "login",
          });
        },
        (error) => {
          // You should handle your error based on your error message
          this.alertService.showError("Forgot Password Failed.");
        },
      );
    },
  },
});
</script>
