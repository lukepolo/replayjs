<template>
  <pre>{{ installScript }}</pre>
</template>

<script>
export default {
  props: {
    site: {
      required: true,
    },
  },
  computed: {
    installScript() {
      return `

      <script async src="${window.location.origin}/js/client.js"><\/script>
      <script>
        window.replayjsQueue = window.replayjsQueue || [];
        function replayjs(){replayjsQueue.push(arguments);}
        replayjs('auth', "${this.site.api_key}");
        replayjs('record');
      <\/script>
      `;
    },
  },
};
</script>
