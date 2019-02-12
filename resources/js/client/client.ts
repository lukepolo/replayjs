import Echo from "laravel-echo";
// @ts-ignore
window.io = require("socket.io-client");
import { TreeMirrorClient } from "./tree-mirror";

export default class Client {
  protected echo = null;
  protected start = null;
  protected channel = null;
  protected movements = [];

  constructor() {
    this.startClient();
  }

  public startClient() {
    this.start = new Date().getTime();

    this.echo = new Echo({
      broadcaster: "socket.io",
      key: "441a88572fdd6f9151442d1d484c0f84",
      authEndpoint: "http://relayjs.test/api/broadcasting/auth",
      host: "http://relayjs.test:6001",
    });

    this.channel = this.echo
      .join(`chat`)
      .here(() => {
        this.setupMirror();
      })
      .joining(() => {
        this.setupMirror();
      })
      .listenForWhisper("initialized", () => {
        this.attachClickEvents();
        this.attachScrollingEvents();
        this.attachWindowResizeEvent();
        this.attachMouseMovementEvents();

        // TODO - watch for removal of replayjs element and re-insert them
        // TODO - watch for body replacement (which would include all of replayjs scripting)
      });
  }

  protected setupMirror() {
    // TODO - mouse movements should send at the same time?
    // TODO - should send timings so we can send in batches
    new TreeMirrorClient(
      document,
      {
        initialize: (rootId, children) => {
          this.channel.whisper("initialize", {
            rootId,
            children,
            base: location.href.match(/^(.*\/)[^\/]*$/)[1],
          });
        },
        applyChanged: (removed, addedOrMoved, attributes, text) => {
          this.channel.whisper("changes", {
            removed,
            addedOrMoved,
            attributes,
            text,
          });
        },
      },
      [{ all: true }],
    );
  }

  protected attachClickEvents() {
    document.onclick = (event: MouseEvent) => {
      this.channel.whisper("click", {
        x: event.clientX,
        y: event.clientY,
      });
    };
  }

  protected attachScrollingEvents() {
    document.onscroll = () => {
      this.channel.whisper("scroll", {
        scrollPosition: document.documentElement.scrollTop,
      });
    };
  }

  protected attachWindowResizeEvent() {
    this.resize();
    window.onresize = () => {
      this.resize();
    };
  }

  private resize() {
    this.channel.whisper("windowSize", {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  protected attachMouseMovementEvents() {
    document.onmousemove = (event: MouseEvent) => {
      this.movements.push({
        x: event.pageX,
        y: event.pageY,
        timing: new Date().getTime() - this.start,
      });
    };
    this.sendMouseMovements();
  }

  protected sendMouseMovements() {
    setTimeout(() => {
      if (this.movements.length) {
        this.channel.whisper("mouseMovement", this.movements);
        this.movements = [];
        this.start = new Date().getTime();
      }
      this.sendMouseMovements();
    }, 1000);
  }
}
new Client();
