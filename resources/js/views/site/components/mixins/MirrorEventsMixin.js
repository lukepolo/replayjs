export default {
  data() {
    return {
      lastCursorPosition: null,
    };
  },
  methods: {
    updateScrollPosition(scrollPosition) {
      window.scrollTo(0, scrollPosition);
    },
    updateMouseMovements(movements) {
      for (let movement in movements) {
        movement = movements[movement];
        setTimeout(() => {
          this.updateCursorPosition(movement.x, movement.y);
        }, movement.timing);
        this.lastCursorPosition = movements[movements.length - 1];
      }
    },
    updateCursorPosition(x, y) {
      this.$refs.cursor.style.top = y + "px";
      this.$refs.cursor.style.left = x + "px";
    },
    addClick(x, y) {
      let node = document.createElement("DIV");
      node.style.top = y + "px";
      node.style.left = x + "px";
      this.$refs.clicks.appendChild(node);
      setTimeout(() => {
        node.remove();
      }, 1001);
    },
    updateWindowSize(width, height) {
      this.previewFrame.style.width = width + "px";
      this.previewFrame.style.height = height + "px";

      this.$refs.overlay.style.width = width + "px";
      this.$refs.overlay.style.height = height + "px";

      this.getScale();
    },

    updateDom(removed, addedOrMoved, attributes, text) {
      this.mirror.applyChanged(removed, addedOrMoved, attributes, text);
    },
  },
};
