<template>
  <div class="my-canvas-wrapper">
    <canvas ref="progress-bar-canvas"></canvas>
    <slot></slot>
  </div>
</template>

<script>
export default {
  provide() {
    return {
      context: this.context,
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
  data() {
    return {
      context: null,
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
      }
    },
  },
  computed: {
    canvas() {
      return this.$refs["progress-bar-canvas"];
    },
  },
  mounted() {
    this.context = this.canvas.getContext("2d");
    this.canvas.height = 20;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "20px";
    this.setCanvasWidth();
  },
};
</script>

<style>
.my-canvas-wrapper {
  position: absolute;
  pointer-events: none;
}
</style>
