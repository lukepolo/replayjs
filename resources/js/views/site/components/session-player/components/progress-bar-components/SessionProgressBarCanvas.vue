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

    window.addEventListener("resize", this.setCanvasWidth);

    this.setCanvasWidth();
  },
  data() {
    return {
      provider: {
        canvas: null,
        context: null,
        canvasWidth: null,
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
        this.provider.canvasWidth = this.canvas.width;
      }
    },
  },
  computed: {
    canvas() {
      return this.$refs.canvas;
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setCanvasWidth);
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
