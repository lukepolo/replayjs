import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ClickDataInterface from "../interfaces/ClickDataInterface";

export default class CaptureClicks implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "click";
  protected channel: NullPresenceChannel;

  constructor(timing: number) {
    this.timing = timing;
  }

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    window.addEventListener("click", this.clicked.bind(this));
  }

  public teardown() {
    window.removeEventListener("click", this.clicked.bind(this));
  }

  private clicked(event: MouseEvent) {
    this.whisper({
      // event : event,
      x: event.clientX,
      y: event.clientY,
      timing: new Date().getTime() - this.timing,
    });
  }

  private whisper(data: ClickDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
