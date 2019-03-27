export default {
  data() {
    return {
      queuedEvents: {},
    };
  },
  methods: {
    queueChanges(changes, event, shouldPlayImmediately = false) {
      for (let timing in changes) {
        let change = changes[timing];
        if (timing >= this.currentTimePosition) {
          if (!this.queuedEvents[timing]) {
            this.queuedEvents[timing] = [];
          }
          this.queuedEvents[timing].push({
            event,
            change,
          });
        } else if (shouldPlayImmediately) {
          this[event](change);
        }
      }
    },
    updateDom({ removed, addedOrMoved, attributes, text, rootId }) {
      if (rootId) {
        // TODO - need to restart the process to handle this as the main root
        console.info("ROOT", rootId);
        return;
      }
      this.mirror.applyChanged(removed, addedOrMoved, attributes, text);
    },
    addMouseClick({ x, y }) {
      let node = document.createElement("DIV");
      node.style.top = y + "px";
      node.style.left = x + "px";
      this.$refs.clicks.appendChild(node);
      setTimeout(() => {
        node.remove();
      }, 1000);
    },
    updateWindowSize({ width, height }) {
      this.previewFrame.style.width = width + "px";
      this.previewFrame.style.height = height + "px";

      this.$refs.overlay.style.width = width + "px";
      this.$refs.overlay.style.height = height + "px";

      this.getScale();
    },
    updateScrollPosition(scrollPosition) {
      window.scrollTo(0, scrollPosition);
    },
    updateMouseMovements({ x, y }) {
      this.$refs.cursor.style.top = y + "px";
      this.$refs.cursor.style.left = x + "px";
    },
  },
};
