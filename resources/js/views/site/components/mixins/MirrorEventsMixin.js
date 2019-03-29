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
        if (!this.watchingLive && timing >= this.currentTimePosition) {
          if (!this.queuedEvents[timing]) {
            this.queuedEvents[timing] = [];
          }
          change.forEach((changeDetails) => {
            this.queuedEvents[timing].push({
              event,
              change: changeDetails,
            });
          });
        } else if (shouldPlayImmediately) {
          for (let changeIndex in change) {
            this[event](change[changeIndex]);
          }
        }
      }
    },
    updateDom({
      removed,
      addedOrMoved,
      attributes,
      text,
      rootId,
      children,
      baseHref,
    }) {
      if (rootId) {
        this.setupIframe({ rootId, children, baseHref });
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
    updateMouseMovement({ x, y }) {
      this.$refs.cursor.style.top = y + "px";
      this.$refs.cursor.style.left = x + "px";
    },
  },
};
