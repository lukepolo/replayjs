import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import WindowResizeDataInterface from "../interfaces/WindowResizeDataInterface";

export default class CaptureWindowResize implements ListenInterface {
  protected readonly timing: number;
  protected channel: NullPresenceChannel;
  protected readonly event = "window-size";

  constructor(timing: number) {
    this.timing = timing;
  }

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
      width: window.innerWidth,
      height: window.innerHeight,
      timing: new Date().getTime() - this.timing,
    });
  }

  private whisper(data: WindowResizeDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
