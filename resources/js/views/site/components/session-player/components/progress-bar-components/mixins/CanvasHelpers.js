export default {
  inject: ["provider"],
  computed: {
    context() {
      return this.provider && this.provider.context;
    },
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
