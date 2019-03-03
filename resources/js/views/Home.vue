<template>
  <div>
    <router-link :to="{ name: 'login' }">Login</router-link>
    <router-link :to="{ name: 'register' }">Register</router-link>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({});
</script>
