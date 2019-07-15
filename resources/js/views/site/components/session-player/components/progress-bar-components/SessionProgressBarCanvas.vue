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
    // TODO - support browsers that do not have access to transferControlToOffscreen

    // We can first get the bitmap render, then transfer to image bitmap instead
    // the worker can decide whether to post a return or not and have the
    // components listen, while its not as good as just using it inside a worker
    // it provides decent performance
    //     var one = document.getElementById("one").getContext("bitmaprenderer");
    //     var two = document.getElementById("two").getContext("bitmaprenderer");
    //
    //     var offscreen = new OffscreenCanvas(256, 256);
    //     var gl = offscreen.getContext('webgl');
    //
    // // ... some drawing for the first canvas using the gl context ...
    //
    // // Commit rendering to the first canvas
    //     var bitmapOne = offscreen.transferToImageBitmap();
    //     one.transferFromImageBitmap(bitmapOne);
    //
    // // ... some more drawing for the second canvas using the gl context ...
    //
    // // Commit rendering to the second canvas
    //     var bitmapTwo = offscreen.transferToImageBitmap();
    //     two.transferFromImageBitmap(bitmapTwo);
    //

    this.provider.canvas = this.canvas.transferControlToOffscreen();
    // this.provider.context = this.canvas.getContext("2d");

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
        // this.canvas.width =
        //   width < window.innerWidth ? window.innerWidth : width;
        this.provider.canvasWidth =
          width < window.innerWidth ? window.innerWidth : width;
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
