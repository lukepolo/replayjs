import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import NetworkRequestDataInterface from "../interfaces/NetworkRequestDataInterface";

export default class CaptureNetworkRequests implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "network-request";
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
    this.setupXhrCapture();
    this.setupFetchCapture();
  }

  public setup() {
    this.setupXhrCapture();
    this.setupFetchCapture();
  }

  public teardown() {
    // TODO
  }

  private setupXhrCapture() {
    let origOpen = XMLHttpRequest.prototype.open;
    let origSend = XMLHttpRequest.prototype.send;
    let origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    let sendNetworkRequest = this.whisper.bind(this);

    XMLHttpRequest.prototype.open = function(method, url) {
      // TODO - make sure this works
      this.setRequestData = (data) => {
        this.requestData = Object.assign({}, this.requestData, data);
      };

      this.setRequestData({
        url,
        method,
        headers: {},
        timestamp: new Date(),
      });

      this.addEventListener("load", function() {
        this.setRequestData({
          endTime: new Date(),
          status: this.status,
          statusText: this.statusText,
          response: this.responseText,
          responseHeaders: this.getAllResponseHeaders(),
        });
        sendNetworkRequest(this.requestData);
      });

      this.addEventListener("error", function() {
        this.setRequestData({
          endTime: new Date(),
          status: this.status,
          statusText: this.statusText,
          response: this.responseText,
          responseHeaders: this.getAllResponseHeaders(),
        });
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

  private setupFetchCapture() {
    // TODO - verify it works
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

  public whisper(data: NetworkRequestDataInterface) {
    if (data.url.indexOf(__ENV_VARIABLES__.app.APP_URL) === -1) {
      this.channel.whisper(this.event, data);
    }
  }
}
