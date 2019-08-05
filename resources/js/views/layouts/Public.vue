<template>
  <div id="landing">
    <alerts></alerts>
    <site-header></site-header>
    <router-view></router-view>
    <site-footer></site-footer>
  </div>
</template>

<script>
import Alerts from "varie/Alerts";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default {
  components: {
    Alerts,
    SiteHeader,
    SiteFooter,
  },
};
</script>
