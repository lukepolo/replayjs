<template>
  <div class="session-progress-bar-canvas__container">
    <canvas ref="canvas"></canvas>
    <slot></slot>
  </div>
</template>

<script>
export default {
  provide() {
    return {
      provider: this.provider,
    };
  },
  props: {
    startingTime: {
      required: true,
    },
    endingTime: {
      required: true,
    },
  },
  mounted() {
    this.provider.canvas = this.canvas;
    this.provider.context = this.canvas.getContext("2d");
    // This is dictated by the sass
    this.canvas.height = 20;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "20px";
    this.setCanvasWidth();
  },
  data() {
    return {
      provider: {
        context: null,
      },
    };
  },
  watch: {
    endingTime: {
      handler() {
        this.setCanvasWidth();
      },
    },
  },
  methods: {
    setCanvasWidth() {
      if (this.canvas) {
        let width = Math.ceil(
          (parseInt(this.endingTime) - parseInt(this.startingTime)) / 1000,
        );
        this.canvas.width =
          width < window.innerWidth ? window.innerWidth : width;
        console.info(`WIDTH`, this.canvas.width);
      }
    },
  },
  computed: {
    canvas() {
      return this.$refs.canvas;
    },
  },
};
</script>

<style lang="scss">
.session-progress-bar-canvas {
  &__container {
    position: absolute;
    pointer-events: none;
    width: 100%;
  }
}
</style>
