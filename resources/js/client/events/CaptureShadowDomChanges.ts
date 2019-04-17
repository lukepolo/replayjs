import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ConsoleDataInterface from "../interfaces/ConsoleDataInterface";

export default class CaptureShadowDomChanges implements ListenInterface {
  protected channel: NullPresenceChannel;
  protected readonly event = "console-message";

  protected originalAttachShadow;
  protected originalCreateShadowRoot;

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    this.originalAttachShadow = HTMLElement.prototype.attachShadow;
    //// this.originalCreateShadowRoot = HTMLElement.prototype.createShadowRoot;

    if (typeof this.originalAttachShadow === "function") {
      HTMLElement.prototype.attachShadow = this.captureShadowEvents(
        this.originalAttachShadow,
      );
    }
    // if(typeof this.originalCreateShadowRoot === 'function') {
    //
    // }
  }

  public teardown() {
    HTMLElement.prototype.attachShadow = this.originalAttachShadow;
    // HTMLElement.prototype.createShadowRoot = this.originalCreateShadowRoot;
  }

  private captureShadowEvents(originalFunction) {
    // let whisper = this.whisper.bind(this);

    return function(option) {
      // whisper({
      //   type,
      //   messages,
      //   timing: Date.now(),
      // });
      var sh = originalFunction.call(this, option);
      console.info("%s shadow attached to %s", option.mode, this);
      //add a MutationObserver here
      return sh;
    };
  }

  private whisper(data: ConsoleDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
