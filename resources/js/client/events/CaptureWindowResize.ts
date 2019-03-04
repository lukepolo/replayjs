import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import WindowResizeDataInterface from "../interfaces/WindowResizeDataInterface";

export default class CaptureWindowResize implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "window-size";
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
  }

  public setup() {
    this.resized();
    window.onresize = () => {
      this.resized();
    };
  }

  public teardown() {
    // TODO
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
