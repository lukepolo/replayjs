<template>
  <div>
    <h1>Login</h1>
    <router-link @click.prevent :to="{ name: 'register' }"
      >Or Create Account</router-link
    >

    <form v-form="form" @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          v-model="form.email"
          validate
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          v-model="form.password"
          validate
        />
      </div>

      <div class="form-group">
        <button class="btn btn--blue" :disabed="!form.isValid()">Login</button>
      </div>

      <div class="form-group">
        <router-link :to="{ name: 'forgot-password' }"
          >Forgot password?</router-link
        >
      </div>
    </form>
  </div>
</template>

<script>
import Vue from "vue";
import ShareAccountInfoMixin from "./mixins/ShareAccountInfoMixin";

export default Vue.extend({
  $inject: ["AlertService"],
  mixins: [ShareAccountInfoMixin],
  data() {
    return {
      form: this.createForm({
        email: null,
        password: null,
      }).validation({
        rules: {
          email: "required|email",
          password: "required|min:8",
        },
      }),
    };
  },
  methods: {
    login() {
      this.$store.dispatch("auth/login", this.form).then(
        () => {
          this.form.reset();
          this.$router.push({
            name: "dashboard",
          });
        },
        (error) => {
          // You should handle your error based on your error message
          this.alertService.showError("Login Failed.");
        },
      );
    },
  },
});
</script>
