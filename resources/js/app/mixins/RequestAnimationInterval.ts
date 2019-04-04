import Vue from "vue";

Vue.mixin({
  methods: {
    requestAnimationInterval(fn, delay = 100) {
      let stop;
      let start = new Date().getTime();

      function loop() {
        let current = new Date().getTime();
        let delta = current - start;

        if (delta >= delay) {
          fn.call();
          start = new Date().getTime();
        }

        if (!stop) {
          requestAnimationFrame(loop);
        }
      }
      requestAnimationFrame(loop);
      return {
        stop: function() {
          stop = 1;
        },
      };
    },
  },
});
