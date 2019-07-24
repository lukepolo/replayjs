import { NodeDataTypes } from "../../../../../client/recorder/interfaces/NodeData";
import NodeDataCompressorService from "../../../../../client/recorder/services/NodeDataCompressorService";
import SessionPlaybackService from "@views/site/components/session-player/services/SessionPlaybackService";

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
    };
  },
  methods: {
    clearIframe() {
      if (this.previewDocument) {
        while (this.previewDocument.firstChild) {
          this.previewDocument.removeChild(this.previewDocument.firstChild);
        }
        this.previewDocument.innerHtml = "";
      }
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
      this.mirror = new SessionPlaybackService(this.previewDocument, {
        createElement: (tagName) => {
          if (tagName === "HEAD") {
            let node = document.createElement("HEAD");
            node.appendChild(document.createElement("BASE"));
            node.firstChild.href = baseHref;
            return node;
          }
        },
        // TODO - this should be put into the replay servicer
        setAttribute: (node, attrName, value) => {
          // TODO - add compression
          // let service = new NodeDataCompressorService()
          // attrName = service.decompressData(service.decompressData(attrName))
          // value = service.decompressData(service.decompressData(value))
          if (
            !["test", "http://localhost"].includes(
              new URL(baseHref).origin.split(".").pop(),
            )
          ) {
            if (node.tagName === "LINK" && attrName === "href") {
              let isRelativeUrlRx = new RegExp(/^\/(?!\/).*/g);
              if (isRelativeUrlRx.test(value)) {
                if (this._isValidTld(value)) {
                  value = `${$config.get(
                    "app.APP_URL",
                  )}/api/asset?url=${baseHref}${value}`;
                }
              }
            }
          }

          if (attrName === "value") {
            node.value = value;
          } else if (attrName === "checked") {
            node.checked = value;
          }

          node.setAttribute(attrName, value);

          return node;
        },
      });
    },
    _isValidTld() {
      return true; // TODO
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
