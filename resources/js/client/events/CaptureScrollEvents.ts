import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ScrollDataInterface from "../interfaces/ScrollDataInterface";

export default class CaptureScrollEvents implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "scroll";
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
  }

  public setup() {
    document.onscroll = (event) => {
      this.whisper({
        target: event.target,
        timing: new Date().getTime() - this.timing,
        scrollPosition: document.documentElement.scrollTop,
      });
    };
  }

  public teardown() {
    // TODO
  }

  private whisper(data: ScrollDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
