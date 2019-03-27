import { TreeMirror } from "../../../../client/vendor/mirror";

export default {
  $inject: ["BroadcastService"],
  created() {
    this.setupSockets();
    window.addEventListener("resize", this.getScale);
  },
  data() {
    return {
      scale: null,
      mirror: null,
      previewFrame: null,
      previewDocument: null,
    };
  },
  methods: {
    clearIframe() {
      while (this.previewDocument.firstChild) {
        this.previewDocument.removeChild(this.previewDocument.firstChild);
      }
      this.previewDocument.innerHtml = "";
    },
    isValidTld() {
      return true;
    },
    setupIframe({ rootId, children, baseHref }) {
      this.clearIframe();
      this._setupMirror(baseHref);
      this.mirror.initialize(rootId, children);
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
    _setupMirror(baseHref) {
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
    setupSockets() {
      this.channel = this.broadcastService.join(
        `stream.${this.$route.params.session}`,
      );
      // this.channel
      // .listenForWhisper("initialize", ({ rootId, children, baseHref }) => {
      //   this.setupMirror(baseHref);
      //   this.setupIframe({ rootId, children });
      //   this.channel.whisper("initialized");
      // })
      // .listenForWhisper("window-size", ({ width, height }) => {
      //   this.previewFrame.style.width = width + "px";
      //   this.previewFrame.style.height = height + "px";
      //   this.getScale();
      // })
      // .listenForWhisper("click", ({ x, y }) => {
      //   let node = document.createElement("DIV");
      //   node.style.top = y + "px";
      //   node.style.left = x + "px";
      //   this.previewDocument.getElementById("clicks").appendChild(node);
      //   setTimeout(() => {
      //     node.remove();
      //   }, 1001);
      // })
      // .listenForWhisper("scroll", ({ scrollPosition }) => {
      //   window.scrollTo(0, scrollPosition);
      // })
      // .listenForWhisper(
      //   "changes",
      //   ({ removed, addedOrMoved, attributes, text }) => {
      //     this.mirror.applyChanged(removed, addedOrMoved, attributes, text);
      //   },
      // )
      // .listenForWhisper("mouse-movement", (movements) => {
      //   movements.forEach((movement) => {
      //     setTimeout(() => {
      //       this.updateCursorPosition(movement.x, movement.y);
      //     }, movement.timing);
      //   });
      //
      //   this.lastCursorPosition = movements[movements.length - 1];
      // });
    },
  },
  computed: {},
  destroyed() {
    window.removeEventListener("resize", this.getScale);
  },
};
