<template>
  <div id="app">
    <alerts></alerts>
    AUTHED LAYOUT
    <router-view></router-view>
  </div>
</template>

<script>
import Alerts from "varie/Alerts";
export default {
  components: {
    Alerts,
  },
};
</script>
