import timing from "../../helpers/timing";
import ListenInterface from "../../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import WindowResizeDataInterface from "../../interfaces/WindowResizeDataInterface";

export default class CaptureWindowResize implements ListenInterface {
  protected channel: NullPresenceChannel;
  protected readonly event = "window-size";

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    this.resized();
    window.addEventListener("resize", this.resized.bind(this));
  }

  public teardown() {
    window.removeEventListener("resize", this.resized.bind(this));
  }

  private resized() {
    this.whisper({
      timing: timing(),
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  private whisper(data: WindowResizeDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
