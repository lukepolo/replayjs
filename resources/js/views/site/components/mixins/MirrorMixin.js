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
      userIsLive: false,
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
      this.channel = this.broadcastService
        .join(`stream.${this.$route.params.session}`)
        .joining((user) => {
          if (user.guest) {
            this.userIsLive = true;
          }
        })
        .leaving((user) => {
          if (user.guest) {
            this.userIsLive = false;
          }
        })
        .here((usersInChannel) => {
          console.info(usersInChannel);
          let hasGuest = usersInChannel.find((guest) => {
            console.info(guest);
            return guest.guest === true;
          });
          console.info(hasGuest);

          this.channel
            .listenForWhisper("window-size", ({ width, height }) => {
              console.info("window-size");
            })
            .listenForWhisper("click", ({ x, y }) => {
              console.info("click");
            })
            .listenForWhisper("scroll", ({ scrollPosition }) => {
              console.info("scroll");
            })
            .listenForWhisper(
              "changes",
              ({ removed, addedOrMoved, attributes, text }) => {
                console.info("changes");
              },
            )
            .listenForWhisper("mouse-movement", (movements) => {
              console.info("mouse-movement");
            })
            .listenForWhisper("network-request", () => {
              console.info("network-request");
            })
            .listenForWhisper("console-message", () => {
              console.info("console-message");
            });
        });
    },
  },
  computed: {
    canViewLive() {
      return this.userIsLive;
    },
  },
  destroyed() {
    window.removeEventListener("resize", this.getScale);
  },
};
