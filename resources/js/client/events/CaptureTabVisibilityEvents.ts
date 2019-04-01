import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import TabVisibilityChangeInterface from "../interfaces/TabVisibilityChangeInterface";

export default class CaptureTabVisibilityEvents implements ListenInterface {
  protected readonly event = "tab-visibility";
  protected channel: NullPresenceChannel;

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    window.addEventListener(
      "visibilitychange",
      this.visiblityChanged.bind(this),
    );
  }

  public teardown() {
    window.removeEventListener(
      "visibilitychange",
      this.visiblityChanged.bind(this),
    );
  }

  private visiblityChanged() {
    this.whisper({
      visible: document.hidden,
      timing: new Date().getTime(),
    });
  }

  private whisper(data: TabVisibilityChangeInterface) {
    this.channel.whisper(this.event, data);
  }
}
