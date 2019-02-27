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
</style>
<template>
  <div class="container">
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
</template>
<script>
import Vue from "vue";
import { TreeMirror } from "./../client/mirror";

// @ts-ignore
import assetWorker from "@app/workers/asset.service-worker";

export default Vue.extend({
  $inject: ["BroadcastService"],
  data() {
    return {
      scale: null,
      mirror: null,
      previewFrame: null,
      previewDocument: null,
      lastCursorPosition: null,
    };
  },
  created() {
    window.addEventListener("resize", this.getScale);
  },
  mounted() {
    this.previewFrame = document.getElementById("preview");
    this.previewDocument = this.previewFrame.contentWindow.document;
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        console.info(assetWorker);
        navigator.serviceWorker
          .register(assetWorker)
          .then(() => {
            this.setupSockets();
          })
          .catch((err) => {
            console.log("ServiceWorker registration failed: ", err);
          });
      });
    }
  },
  methods: {
    clearIframe() {
      while (this.previewDocument.firstChild) {
        this.previewDocument.removeChild(this.previewDocument.firstChild);
      }
    },
    setupMirror(base) {
      this.mirror = new TreeMirror(this.previewDocument, {
        createElement: (tagName) => {
          if (tagName === "SCRIPT") {
            let node = document.createElement("NO-SCRIPT");
            node.style.display = "none";
            return node;
          }
          if (tagName === "HEAD") {
            let node = document.createElement("HEAD");
            node.appendChild(document.createElement("BASE"));
            node.firstChild.href = base;
            return node;
          }
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
    setupSockets() {
      this.channel = this.broadcastService.join(`chat`);
      this.channel
        .listenForWhisper("initialize", ({ rootId, children, base }) => {
          this.setupMirror(base);
          this.setupIframe({ rootId, children });
          this.channel.whisper("initialized");
        })
        .listenForWhisper("windowSize", ({ width, height }) => {
          this.previewFrame.style.width = width + "px";
          this.previewFrame.style.height = height + "px";
          this.getScale();
        })
        .listenForWhisper("click", ({ x, y }) => {
          let node = document.createElement("DIV");
          node.style.top = y + "px";
          node.style.left = x + "px";
          this.previewDocument.getElementById("clicks").appendChild(node);
          setTimeout(() => {
            node.remove();
          }, 1001);
        })
        .listenForWhisper("scroll", ({ scrollPosition }) => {
          window.scrollTo(0, scrollPosition);
        })
        .listenForWhisper(
          "changes",
          ({ removed, addedOrMoved, attributes, text }) => {
            this.mirror.applyChanged(removed, addedOrMoved, attributes, text);
          },
        )
        .listenForWhisper("mouseMovement", (movements) => {
          movements.forEach((movement) => {
            setTimeout(() => {
              this.updateCursorPosition(movement.x, movement.y);
            }, movement.timing);
          });

          this.lastCursorPosition = movements[movements.length - 1];
        })
        .listenForWhisper("assets", (assets) => {
          console.group("DOWNLOAD ASSETS");
          console.info(assets);
          console.groupEnd();
        });
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
  background-image: url("http://replayjs.test/img/cursor.png");
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
  destroyed() {
    window.removeEventListener("resize", this.getScale);
  },
});
</script>
