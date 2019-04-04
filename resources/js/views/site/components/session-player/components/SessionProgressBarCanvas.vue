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
      provider: this.provider,
    };
  },
  props: {
    startingPosition: {
      required: true,
    },
    endingPosition: {
      required: true,
    },
  },
  data() {
    return {
      provider: {
        context: null,
      },
    };
  },
  watch: {
    endingPosition: {
      handler() {
        this.setCanvasWidth();
      },
    },
  },
  methods: {
    setCanvasWidth() {
      if (this.canvas) {
        let width = Math.ceil(
          (parseInt(this.endingPosition) - parseInt(this.startingPosition)) /
            1000,
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
    this.provider.context = this.canvas.getContext("2d");
    this.canvas.height = 100;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100px";
    this.setCanvasWidth();
  },
};
</script>

<style>
.scaleing {
  /*transform: scale(1);*/
}
</style>
