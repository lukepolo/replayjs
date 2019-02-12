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
        this.attachClickEvents(); // WORKS
        this.attachScrollingEvents(); // WORKS
        this.attachWindowResizeEvent(); // WORKS
        this.attachMouseMovementEvents(); // WORKS
        this.attachAttributeHandlersToInputs();
      });
  }

  protected setupMirror() {
    // TODO - mouse movements should send at the same time?
    // TODO - should send timings so we can send in batches
    new TreeMirrorClient(document, {
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
    });
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

  // TODO -THIS ONE HAS SOME WORK
  protected attachAttributeHandlersToInputs() {
    Array.from(
      document.querySelectorAll<HTMLInputElement>("input, textarea"),
    ).forEach((element) => {
      element.oninput = (event: Event) => {
        let target = <HTMLInputElement>event.target;
        let type = target.type;
        if (type) {
          switch (type) {
            case "text":
            case "textarea":
              target.setAttribute("value", target.value);
              break;
          }
        }
      };
    });

    Array.from(document.querySelectorAll<HTMLSelectElement>("select")).forEach(
      (element) => {
        element.onchange = (event: Event) => {
          let target = <HTMLSelectElement>event.target;
          target.setAttribute(
            "selected-option",
            target.selectedIndex.toString(),
          );
        };
      },
    );

    Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"], input[type="radio"]',
      ),
    ).forEach((element) => {
      element.onchange = (event: Event) => {
        let target = <HTMLSelectElement>event.target;
        Array.from(
          document.querySelectorAll<HTMLInputElement>(
            `input[type="radio"][name="${target.name}"]`,
          ),
        ).forEach((element) => {
          element.removeAttribute("checked");
        });
        // @ts-ignore
        target.setAttribute("checked", target.checked);
      };
    });
  }
}
new Client();
