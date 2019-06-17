<template>
  <div>
    <h1>Create Account</h1>
    <router-link :to="{ name: 'login' }">Or Login</router-link>
    <p>Fill out the following fields to create your account.</p>

    <form v-form="form" @submit.prevent="register">
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" name="name" v-model="form.name" validate />
      </div>

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
          Sign Up
        </button>
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
  mixins: [ShareAccountInfoMixin],
  data() {
    return {
      form: this.createForm({
        name: null,
        email: null,
        password: null,
        passwordConfirmed: null,
      }).validation({
        rules: {
          name: "required",
          email: "required|email",
          password: "required|min:8|confirmed",
        },
      }),
    };
  },
  methods: {
    register() {
      this.$store.dispatch("auth/register", this.form.data()).then(
        () => {
          this.form.reset();
          this.$router.push({
            name: "dashboard",
          });
        },
        (error) => {
          // You should handle your error based on your error message
          this.alertService.showError("Registration Failed.");
        },
      );
    },
  },
});
</script>
