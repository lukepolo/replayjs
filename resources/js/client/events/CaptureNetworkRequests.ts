import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import NetworkRequestDataInterface from "../interfaces/NetworkRequestDataInterface";

export default class CaptureNetworkRequests implements ListenInterface {
  protected readonly timing: number;
  protected channel: NullPresenceChannel;
  protected readonly event = "network-request";

  protected originalFetch;
  protected originalXMLHttpRequestOpen;
  protected originalXMLHttpRequestSend;
  protected originalXMLHttpSetRequestHeader;

  constructor(timing: number) {
    this.timing = timing;
  }

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    this.setupXhrCapture();
    this.setupFetchCapture();
  }

  public teardown() {
    this.teardownXhrCapture();
    this.tearDownFetchCapture();
  }

  private setupXhrCapture() {
    let originalXMLHttpRequestOpen = (this.originalXMLHttpRequestOpen =
      XMLHttpRequest.prototype.open);
    let originalXMLHttpRequestSend = (this.originalXMLHttpRequestSend =
      XMLHttpRequest.prototype.send);
    let originalXMLHttpSetRequestHeader = (this.originalXMLHttpSetRequestHeader =
      XMLHttpRequest.prototype.setRequestHeader);

    let sendNetworkRequest = this.whisper.bind(this);

    XMLHttpRequest.prototype.open = function(method, url) {
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

      return originalXMLHttpRequestOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(data) {
      this.requestData.data = data;
      console.info("We made need this?");
      console.info(this.onreadystatechange);
      return originalXMLHttpRequestSend.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      if (name.toLowerCase() !== "authorization") {
        this.requestData.headers[name] = value;
      }
      return originalXMLHttpSetRequestHeader.apply(this, arguments);
    };
  }

  private teardownXhrCapture() {
    XMLHttpRequest.prototype.open = this.originalXMLHttpRequestOpen;
    XMLHttpRequest.prototype.send = this.originalXMLHttpRequestSend;
    XMLHttpRequest.prototype.setRequestHeader = this.originalXMLHttpSetRequestHeader;
  }

  private setupFetchCapture() {
    // TODO - verify it works
    if (window.fetch) {
      let originalFetch = (this.originalFetch = window.fetch);
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

  private tearDownFetchCapture() {
    window.fetch = this.originalFetch;
  }

  public whisper(data: NetworkRequestDataInterface) {
    if (data.url.indexOf(__ENV_VARIABLES__.app.APP_URL) === -1) {
      this.channel.whisper(this.event, data);
    }
  }
}
