<template>
  <div id="app">
    <site-header></site-header>
    <router-view></router-view>
    <site-footer></site-footer>
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Alerts from "varie/Alerts";
export default {
  components: {
    Alerts,
    SiteHeader,
    SiteFooter,
  },
};
</script>
