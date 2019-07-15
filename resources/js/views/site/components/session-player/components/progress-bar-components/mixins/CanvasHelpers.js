export default {
  inject: ["provider"],
  computed: {
    canvas() {
      return this.provider && this.provider.canvas;
    },
    canvasWidth() {
      return this.provider && this.provider.canvasWidth;
    },
    isTransferable() {
      return this.provider && this.provider.isTransferable;
    },
  },
};
