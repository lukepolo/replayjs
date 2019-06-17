import Vue from "vue";

Vue.mixin({
  methods: {
    requestAnimationInterval(fn, delay = 10) {
      let stop;
      let start = Date.now();

      function loop() {
        let current = Date.now();
        let delta = current - start;

        if (delta >= delay) {
          fn.call();
          start = Date.now();
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
