import Vue from "vue";

Vue.mixin({
  methods: {
    requestAnimationInterval(fn, delay = 10) {
      let stop;
      let start = performance.now();

      function loop(time) {
        if (time - start >= delay) {
          fn.call();
          start = time;
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
