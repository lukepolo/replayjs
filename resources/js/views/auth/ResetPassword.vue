<template>
  <div>
    <h1>Reset Password</h1>
    <router-link :to="{ name: 'login' }">Or Login</router-link>

    <form v-form="form" @submit.prevent="resetPassword">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          label="Email"
          type="email"
          v-model="form.email"
          validate
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          v-model="form.password"
          validate
        />
      </div>

      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          v-model="form.password_confirmation"
          validate
        />
      </div>

      <div class="form-group">
        <button class="btn btn--blue" :disabed="!form.isValid()">
          Reset Password
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  created() {
    if (!this.token) {
      this.alertService.showError("Invalid Reset Password Token");
      this.$router.push({
        name: "login",
      });
    }
  },
  data() {
    return {
      form: this.createForm({
        email: null,
        password: null,
        passwordConfirmed: null,
      }).validation({
        rules: {
          email: "required|email",
          password: "required|min:8|confirmed",
        },
      }),
    };
  },
  methods: {
    resetPassword() {
      this.$store
        .dispatch(
          "auth/resetPassword",
          Object.assign({
            ...this.form.data(),
            token: this.token,
          }),
        )
        .then(
          () => {
            this.form.reset();
            this.$router.push({
              name: "dashboard",
            });
          },
          (error) => {
            // You should handle your error based on your error message
            this.alertService.showError("Reset Password Failed.");
          },
        );
    },
  },
  computed: {
    token() {
      return this.$route.query.token;
    },
  },
});
</script>
