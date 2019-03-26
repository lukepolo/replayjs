import { TreeMirror } from "../../../../client/vendor/mirror";

export default {
  created() {
    window.addEventListener("resize", this.getScale);
  },
  data() {
    return {
      scale: null,
      mirror: null,
      previewFrame: null,
      previewDocument: null,
      lastCursorPosition: null,
      currentTimePosition: 0,
      timeInterval: null,
      timeoutUpdates: [],
    };
  },
  methods: {
    initializePlayer(startTime) {
      this.setupMirror(this.rootDom.baseHref);
      this.setupIframe({
        rootId: this.rootDom.rootId,
        children: this.rootDom.children,
      });
      this.currentTimePosition = startTime || 0;
      for (let timing in this.domChanges) {
        if (timing <= this.currentTimePosition) {
          this.domChanges[timing].forEach((domChanges) => {
            if (!domChanges.rootId) {
              setTimeout(() => {
                this.updateDom(
                  domChanges.removed,
                  domChanges.addedOrMoved,
                  domChanges.attributes,
                  domChanges.text,
                );
              }, 0);
            } else {
              console.info("WE HAD A ROOT ELEMENT SOMEHOW");
            }
          });
        }
      }

      // TODO - window size / scroll position for initializing
      let { height, width } = this.session.window_size_changes[
        Object.keys(this.session.window_size_changes)[0]
      ];
      this.updateWindowSize(width, height);
    },
    navigate(startTime) {
      let wasPlaying = this.isPlaying;
      if (this.isPlaying) {
        this.stop();
      }
      this.currentTimePosition = startTime;
      this.initializePlayer(startTime);
      if (wasPlaying) {
        this.play();
      }
    },
    play() {
      for (let timing in this.domChanges) {
        if (timing >= this.currentTimePosition) {
          this.domChanges[timing].forEach((domChanges) => {
            if (!domChanges.rootId) {
              this.timeoutUpdates.push(
                setTimeout(() => {
                  this.updateDom(
                    domChanges.removed,
                    domChanges.addedOrMoved,
                    domChanges.attributes,
                    domChanges.text,
                  );
                }, timing - this.currentTimePosition),
              );
            } else {
              console.info("WE HAD A ROOT ELEMENT SOMEHOW");
            }
          });
        }
      }
      this.timeInterval = setInterval(() => {
        this.currentTimePosition = this.currentTimePosition + 100;
      }, 100);

      // for (let timing in session.mouse_movements) {
      //   this.updateMouseMovements(session.mouse_movements[timing]);
      // }

      // for (let timing in session.mouse_clicks) {
      //   setTimeout(() => {
      //     let { x, y } = session.mouse_clicks[timing];
      //     this.addClick(x, y);
      //   }, session.mouse_clicks[timing].timing);
      // }
    },
    stop() {
      this.timeoutUpdates.forEach((update, index) => {
        clearTimeout(update);
        delete this.timeoutUpdates[index];
      });
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    },
    clearIframe() {
      while (this.previewDocument.firstChild) {
        this.previewDocument.removeChild(this.previewDocument.firstChild);
      }
    },
    isValidTld() {
      return true;
    },
    setupMirror(baseHref) {
      this.mirror = new TreeMirror(this.previewDocument, {
        createElement: (tagName) => {
          if (tagName === "HEAD") {
            let node = document.createElement("HEAD");
            node.appendChild(document.createElement("BASE"));
            node.firstChild.href = baseHref;
            return node;
          }
        },
        setAttribute: (node, attrName, value) => {
          node.setAttribute(attrName, value);
          if (
            !["test", "http://localhost"].includes(
              new URL(baseHref).origin.split(".").pop(),
            )
          ) {
            if (node.tagName === "LINK" && attrName === "href") {
              let isRelativeUrlRx = new RegExp(/^\/(?!\/).*/g);
              if (isRelativeUrlRx.test(value)) {
                if (this.isValidTld(value)) {
                  value = `${$config.get(
                    "app.APP_URL",
                  )}/api/asset?url=${baseHref}${value}`;
                }
                node.setAttribute(attrName, value);
              }
            }
          }
          return node;
        },
      });
    },
    setupIframe({ rootId, children }) {
      this.clearIframe();
      this.mirror.initialize(rootId, children);
    },
    updateWindowSize(width, height) {
      this.previewFrame.style.width = width + "px";
      this.previewFrame.style.height = height + "px";

      this.$refs.overlay.style.width = width + "px";
      this.$refs.overlay.style.height = height + "px";

      this.getScale();
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
    updateDom(removed, addedOrMoved, attributes, text) {
      this.mirror.applyChanged(removed, addedOrMoved, attributes, text);
    },
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
    getScale() {
      this.$nextTick(() => {
        if (this.$refs.hasOwnProperty("previewBox")) {
          this.scale = Math.min(
            this.$refs.previewBox.offsetWidth /
              parseInt(this.previewFrame.style.width),
            this.$refs.previewBox.offsetHeight /
              parseInt(this.previewFrame.style.height),
          );
        } else {
          this.scale = 1;
        }
        this.$refs.overlay.style.transform = `scale(${this.scale})`;
        if (this.$refs.hasOwnProperty("preview")) {
          this.$refs.preview.style.transform = `scale(${this.scale})`;
        }
      });
    },
  },
  computed: {
    rootDom() {
      return this.session.root;
    },
    domChanges() {
      return this.session.dom_changes;
    },
    startTiming() {
      return this.rootDom && this.rootDom.timing;
    },
    endTiming() {
      let keys = Object.keys(this.domChanges);
      return keys[keys.length - 1];
    },
    isPlaying() {
      return this.timeInterval !== null;
    },
  },
  destroyed() {
    window.removeEventListener("resize", this.getScale);
  },
};
