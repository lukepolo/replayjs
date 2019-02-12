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
      <iframe ref="preview" id="preview"></iframe>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { TreeMirror } from "./../client/mirror";
export default Vue.extend({
  $inject: ["BroadcastService"],
  data() {
    return {
      scale: null,
      base: null,
      previewDocument: null,
      previewFrame: null,
      clickTimeout: null,
      initialized: false,
    };
  },
  mounted() {
    window.addEventListener("resize", this.getScale);

    this.previewFrame = document.getElementById("preview");
    this.previewDocument = document.getElementById(
      "preview",
    ).contentWindow.document;

    while (this.previewDocument.firstChild) {
      this.previewDocument.removeChild(this.previewDocument.firstChild);
    }

    let mirror = new TreeMirror(this.previewDocument, {
      createElement: (tagName) => {
        if (tagName === "SCRIPT") {
          let node = document.createElement("NO-SCRIPT");
          node.style.display = "none";
          return node;
        }
        if (tagName === "HEAD") {
          let node = document.createElement("HEAD");
          // TODO - this only fixes relative URLS not absolute
          let baseHref = document.createElement("BASE");
          node.appendChild(baseHref);
          node.firstChild.href = "http://codepier.test/";
          return node;
        }
      },
    });
    this.channel = this.broadcastService.join(`chat`);
    this.channel
      .listenForWhisper("initialize", ({ rootId, children, base }) => {
        if (!this.initialized) {
          this.base = base;
          mirror.initialize(rootId, children);

          let cursorNode = document.createElement("DIV");
          cursorNode.id = "cursor";

          let clicksNode = document.createElement("DIV");
          clicksNode.id = "clicks";

          console.info("PUT IN");
          this.previewDocument.body.appendChild(cursorNode);
          this.previewDocument.body.appendChild(clicksNode);

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
        }

        this.initialized = true;
        this.channel.whisper("initialized", {
          init: true,
        });

        // while (this.previewDocument.firstChild) {
        //     this.previewDocument.removeChild(this.previewDocument.firstChild);
        // }
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
        this.clickTimeout = setTimeout(() => {
          node.remove();
        }, 1001);
      })
      .listenForWhisper("scroll", ({ scrollPosition }) => {
        window.scrollTo(0, scrollPosition);
      })
      .listenForWhisper(
        "changes",
        ({ removed, addedOrMoved, attributes, text }) => {
          mirror.applyChanged(removed, addedOrMoved, attributes, text);
        },
      )
      .listenForWhisper("mouseMovement", (movements) => {
        movements.forEach((movement) => {
          setTimeout(() => {
            this.previewDocument.getElementById("cursor").style.top =
              movement.y + "px";
            this.previewDocument.getElementById("cursor").style.left =
              movement.x + "px";
          }, movement.timing);
        });
      });
  },
  methods: {
    getScale() {
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
    },
  },
  destroyed() {
    window.removeEventListener("resize", this.getScale);
  },
});
</script>
