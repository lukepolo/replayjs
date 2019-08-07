<template>
  <header class="header">
    <nav class="site-header">
      <div class="site-header__logo">
        <router-link to="/" tag="span" class="cursor-pointer logo">
          <replay-logo></replay-logo>
        </router-link>
      </div>

      <div>
        <router-link :to="{ name: 'login' }">Login</router-link>
      </div>
      <div>
        <router-link :to="{ name: 'register' }">Sign Up</router-link>
      </div>
    </nav>
  </header>
</template>

<script>
export default {};
</script>
