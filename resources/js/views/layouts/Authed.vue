<template>
  <div id="app">
    <alerts></alerts>
    <div class="menu">
      <app-menu></app-menu>
    </div>
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Alerts from "varie/Alerts";
import AppMenu from "./components/AppMenu";

export default {
  components: {
    Alerts,
    AppMenu,
  },
};
</script>
