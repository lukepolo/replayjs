declare global {
  interface Window {
    replayjsQueue: Array<any>;
    Pusher: PusherConnector;
  }
}

import Echo from "laravel-echo";
import { TreeMirrorClient } from "./tree-mirror";
import { PusherConnector } from "laravel-echo/dist/connector";

window.Pusher = require("pusher-js");

const baseHref = window.location.origin;

export default class Client {
  protected echo = null;
  protected streamClient;
  protected apiKey = null;
  protected timing = null;
  protected channel = null;
  protected movements = [];

  constructor() {
    window.replayjsQueue.forEach((args) => {
      this[args[0]](args[1]);
    });
    this.startClient();
  }

  public setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  public startClient() {
    this.timing = new Date().getTime();
    this.echo = new Echo({
      broadcaster: "pusher",
      wsHost: __ENV_VARIABLES__.app.WS_HOST,
      wsPort: __ENV_VARIABLES__.app.WS_PORT,
      key: __ENV_VARIABLES__.services.PUSHER_APP_KEY,
      authEndpoint: `${__ENV_VARIABLES__.app.APP_URL}/api/broadcasting/auth`,
      disableStats: true,
      auth: {
        headers: {
          Authorization: "Bearer " + this.apiKey,
        },
      },
    });

    this.channel = this.echo
      .join(`chat`)
      .here(() => {
        this.setupMirror();
        this.sendSessionDetails();
      })
      .joining(() => {
        this.setupMirror();
      });

    this.setupNetworkMonitor();
    this.attachClickEvents();
    this.attachFetchRequests();
    this.attachScrollingEvents();
    this.attachWindowResizeEvent();
    this.attachMouseMovementEvents();
    this.attachAttributeHandlersToInputs();
  }

  protected setupMirror() {
    if (this.streamClient) {
      this.streamClient.disconnect();
    }
    this.streamClient = new TreeMirrorClient(
      document,
      {
        initialize: (rootId, children) => {
          this.channel.whisper("initialize", {
            rootId,
            children,
            baseHref,
            timing: new Date().getTime() - this.timing,
          });
          this.resize();
        },
        applyChanged: (removed, addedOrMoved, attributes, text) => {
          this.channel.whisper("changes", {
            text,
            removed,
            baseHref,
            attributes,
            addedOrMoved,
            timing: new Date().getTime() - this.timing,
          });
          if (addedOrMoved.length) {
            this.attachAttributeHandlersToInputs();
          }
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
        timing: new Date().getTime() - this.timing,
      });
    };
  }

  protected attachScrollingEvents() {
    document.onscroll = () => {
      this.channel.whisper("scroll", {
        timing: new Date().getTime() - this.timing,
        scrollPosition: document.documentElement.scrollTop,
      });
    };
  }

  protected attachWindowResizeEvent() {
    window.onresize = () => {
      this.resize();
    };
  }

  private resize() {
    this.channel.whisper("window-size", {
      width: window.innerWidth,
      height: window.innerHeight,
      timing: new Date().getTime() - this.timing,
    });
  }

  private sendSessionDetails() {
    this.channel.whisper("session-details", {
      apiKey: this.apiKey,
    });
  }

  protected attachMouseMovementEvents() {
    document.onmousemove = (event: MouseEvent) => {
      this.movements.push({
        x: event.pageX,
        y: event.pageY,
        timing: new Date().getTime() - this.timing,
      });
    };
    // TODO - sometimes this doesn't get attached properly?
    setInterval(() => {
      if (this.movements.length) {
        this.channel.whisper("mouse-movement", this.movements);
        this.movements = [];
      }
    }, 1000);
  }

  protected sendNetworkRequest(requestData) {
    if (requestData.url.indexOf(__ENV_VARIABLES__.app.APP_URL) === -1) {
      console.info(requestData);
      return this.channel.whisper("network-request", requestData);
    }
  }

  protected setupNetworkMonitor() {
    let origOpen = XMLHttpRequest.prototype.open;
    let origSend = XMLHttpRequest.prototype.send;
    let origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    let sendNetworkRequest = this.sendNetworkRequest.bind(this);
    XMLHttpRequest.prototype.open = function(method, url) {
      this.requestData = {
        url,
        method,
        headers: {},
        timestamp: new Date(),
      };
      this.addEventListener("load", function() {
        this.requestData.endTime = new Date();
        this.requestData.status = this.status;
        this.requestData.statusText = this.statusText;
        this.requestData.response = this.responseText;
        this.requestData.responseHeaders = this.getAllResponseHeaders();
        sendNetworkRequest(this.requestData);
      });

      this.addEventListener("error", function() {
        this.requestData.endTime = new Date();
        this.requestData.status = this.status;
        this.requestData.statusText = this.statusText;
        this.requestData.response = this.responseText;
        this.requestData.responseHeaders = this.getAllResponseHeaders();
        sendNetworkRequest(this.requestData);
      });
      origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(data) {
      this.requestData.data = data;
      if (this.onreadystatechange) {
        return origSend.apply(this, arguments);
      }
    };

    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      if (name.toLowerCase() !== "authorization") {
        this.requestData.headers[name] = value;
      }
      return origSetRequestHeader.apply(this, arguments);
    };
  }

  protected attachFetchRequests() {
    if (window.fetch) {
      let originalFetch = window.fetch;
      window.fetch = function() {
        console.info("FETCH STARTED");
        return new Promise((resolve, reject) => {
          originalFetch
            .apply(this, arguments)
            .then(function(data) {
              console.info(data);
              resolve(data);
            })
            .catch((error) => {
              console.info("REQUEST FAILED");
              reject(error);
            });
        });
      };
    }
  }

  protected attachAttributeHandlersToInputs() {
    document.querySelectorAll("input, textarea").forEach((element) => {
      // @ts-ignore
      element.oninput = (event) => {
        let type = event.target.type;
        if (type) {
          switch (type) {
            case "text":
            case "textarea":
              event.target.setAttribute("value", event.target.value);
              break;
          }
        }
      };
    });

    document.querySelectorAll("select").forEach((element) => {
      element.onchange = (event) => {
        // @ts-ignore
        event.target.setAttribute(
          "selected-option",
          // @ts-ignore
          event.target.selectedIndex,
        );
      };
    });

    document
      .querySelectorAll('input[type="checkbox"], input[type="radio"]')
      .forEach((element) => {
        // @ts-ignore
        element.onchange = (event) => {
          document
            .querySelectorAll(
              `input[type="radio"][name="${event.target.name}"]`,
            )
            .forEach((element) => {
              element.removeAttribute("checked");
            });
          event.target.setAttribute("checked", event.target.checked);
        };
      });
  }
}
new Client();
