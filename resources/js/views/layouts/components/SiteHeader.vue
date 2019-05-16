<template>
  <div class="site-header">
    <div class="site__logo">
      <replay-logo></replay-logo>
    </div>

    <div></div>

    <div>
      <div class="site-header__nav-item">
        <router-link :to="{ name: 'login' }">Login</router-link>
      </div>
      <div class="site-header__nav-item">
        <router-link :to="{ name: 'register' }">Sign Up</router-link>
      </div>
    </div>
  </div>
</template>
