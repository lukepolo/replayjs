<style>
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
  z-index: 1;
  width: 25px;
  height: 25px;
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("./../../images/cursor.png");
}

#preview {
  transform: scale(1);
  transform-origin: 0 0;
}
</style>
<template>
  <div>
    <iframe id="preview"></iframe>
  </div>
</template>
<script>
import Vue from "vue";
import { TreeMirror } from "tree-mirror";
export default Vue.extend({
  $inject: ["BroadcastService"],
  data() {
    return {
      base: null,
      previewDocument: null,
      previewFrame: null,
      clickTimeout: null,
      initialized: false,
    };
  },
  mounted() {
    this.previewFrame = document.getElementById("preview");
    this.previewDocument = document.getElementById(
      "preview",
    ).contentWindow.document;

    // let cssLink = document.createElement("link");
    //     cssLink.href = "preview-styles.css";
    //     cssLink.rel = "stylesheet";
    //     cssLink.type = "text/css";
    // this.previewDocument.head.appendChild(cssLink);

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
          node.appendChild(document.createElement("BASE"));
          // node.firstChild.href = 'http://localdev/dev/fssa/voucher/';
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
});
</script>
