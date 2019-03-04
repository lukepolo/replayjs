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
    window.onresize = () => {
      this.whisper({
        width: window.innerWidth,
        height: window.innerHeight,
        timing: new Date().getTime() - this.timing,
      });
    };
  }

  public teardown() {
    // TODO
  }

  private whisper(data: WindowResizeDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
