import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ClickDataInterface from "../interfaces/ClickDataInterface";

export default class CaptureClicks implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "click";
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
  }

  public setup() {
    document.onclick = (event: MouseEvent) => {
      this.whisper({
        x: event.clientX,
        y: event.clientY,
        timing: new Date().getTime() - this.timing,
      });
    };
  }

  public teardown() {
    // TODO
  }

  private whisper(data: ClickDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
