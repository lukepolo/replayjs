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
    // This is dictated by the sass
    this.canvas.style.width = "100%";
    this.canvas.style.height = "20px";

    if (this.canvas.transferControlToOffscreen) {
      this.provider.isTransferable = true;
      this.provider.canvas = this.canvas.transferControlToOffscreen();
    } else {
      this.provider.canvas = this.canvas.getContext("bitmaprenderer");
    }

    window.addEventListener("resize", this.setCanvasWidth);

    this.setCanvasWidth();
  },
  data() {
    return {
      provider: {
        canvas: null,
        canvasWidth: null,
        isTransferable: false,
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

        let canvasWidth = width < window.innerWidth ? window.innerWidth : width;

        if (!this.provider.isTransferable) {
          this.canvas.width = canvasWidth;
        }
        this.provider.canvasWidth = canvasWidth;
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
