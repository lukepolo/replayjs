<style lang="scss">
body {
  margin: 0;
}
#preview {
  transform-origin: 0 0;
}

.container {
  display: flex;
  max-height: 100vh;
}

.left-nav {
  display: flex;
  flex: 0 0 150px;
}

.preview-box {
  overflow: hidden;
  max-height: 100%;
  flex: 1 1 auto;
}

.recordings {
  height: 100px;
  overflow: hidden;
}
</style>
<template>
  <div>
    <div class="">
      <div class="left-nav">
        <h1>Scale</h1>
        <pre>{{ scale }}</pre>
      </div>
      <div class="preview-box" ref="previewBox">
        <iframe
          ref="preview"
          id="preview"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
    <h3>Network Requests</h3>
    <div v-if="recording">
      <pre>{{ recording.network_requests }}</pre>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { TreeMirror } from "./../client/mirror";

export default Vue.extend({
  data() {
    return {
      scale: null,
      mirror: null,
      previewFrame: null,
      previewDocument: null,
      lastCursorPosition: null,
    };
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.dispatch("recording/show", this.$route.params.recording);
      },
    },
    recording: {
      handler(recording) {
        let domChanges = recording.dom_changes;
        let { rootId, children, baseHref } = domChanges[
          Object.keys(domChanges)[0]
        ];

        this.setupMirror(baseHref);
        this.setupIframe({ rootId, children });

        let { height, width } = recording.window_size_changes[
          Object.keys(recording.window_size_changes)[0]
        ];
        this.updateWindowSize(width, height);

        for (let timing in recording.dom_changes) {
          setTimeout(() => {
            let {
              removed,
              addedOrMoved,
              attributes,
              text,
            } = recording.dom_changes[timing];
            if (removed) {
              setTimeout(() => {
                this.updateDom(removed, addedOrMoved, attributes, text);
              }, 0);
            }
          }, recording.dom_changes[timing].timing);
        }

        for (let timing in recording.mouse_movements) {
          this.updateMouseMovements(recording.mouse_movements[timing]);
        }

        for (let timing in recording.mouse_clicks) {
          setTimeout(() => {
            let { x, y } = recording.mouse_clicks[timing];
            this.addClick(x, y);
          }, recording.mouse_clicks[timing].timing);
        }
      },
    },
  },
  created() {
    window.addEventListener("resize", this.getScale);
  },
  mounted() {
    this.previewFrame = document.getElementById("preview");
    this.previewDocument = this.previewFrame.contentWindow.document;
  },
  methods: {
    play() {},
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
      this.addClicks();
      this.addCursor();
      this.insertStyles();
    },
    addCursor() {
      let cursorNode = document.createElement("DIV");
      cursorNode.id = "cursor";
      this.previewDocument.body.appendChild(cursorNode);
      if (this.lastCursorPosition) {
        this.updateCursorPosition(
          this.lastCursorPosition.x,
          this.lastCursorPosition.y,
        );
      }
    },
    addClicks() {
      let clicksNode = document.createElement("DIV");
      clicksNode.id = "clicks";
      this.previewDocument.body.appendChild(clicksNode);
    },
    updateWindowSize(width, height) {
      this.previewFrame.style.width = width + "px";
      this.previewFrame.style.height = height + "px";
      this.getScale();
    },
    addClick(x, y) {
      let node = document.createElement("DIV");
      node.style.top = y + "px";
      node.style.left = x + "px";
      this.previewDocument.getElementById("clicks").appendChild(node);
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
      this.previewDocument.getElementById("cursor").style.top = y + "px";
      this.previewDocument.getElementById("cursor").style.left = x + "px";
    },
    insertStyles() {
      let styles = document.createElement("style");
      styles.innerHTML = `
@-webkit-keyframes load-progress {
  100% {
    opacity: 0;
    margin-top: -40px;
    margin-left: -40px;
    border-width: 40px;
  }
}

@keyframes load-progress {
  100% {
    opacity: 0;
    margin-top: -40px;
    margin-left: -40px;
    border-width: 40px;
  }
}

#clicks div {
  width: 0;
  height: 0;
  opacity: 0.6;
  position: fixed;
  border-radius: 50%;
  border: 1px solid #6c7a89;
  background-color: #6c7a89;
  animation: load-progress 1s;
}

#cursor {
  top: 1px;
  z-index: 999999999999999999;
  width: 25px;
  height: 25px;
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("${$config.get("app.APP_URL")}/img/cursor.png");
}
`;
      this.previewDocument.head.appendChild(styles);
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
        if (this.$refs.hasOwnProperty("preview")) {
          this.$refs.preview.style.transform = `scale(${this.scale})`;
        }
      });
    },
  },
  computed: {
    recording() {
      return this.$store.state.recording.recording;
    },
  },
  destroyed() {
    window.removeEventListener("resize", this.getScale);
  },
});
</script>
