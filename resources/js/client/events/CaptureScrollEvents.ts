import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ScrollDataInterface from "../interfaces/ScrollDataInterface";

export default class CaptureScrollEvents implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "scroll";
  protected ticking: boolean = false;
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
  }

  public setup() {
    window.addEventListener("scroll", this.scrolled);
  }

  public teardown() {
    window.removeEventListener("scroll", this.scrolled);
  }

  private scrolled(event) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.whisper({
          target: event.target,
          timing: new Date().getTime() - this.timing,
          scrollPosition: document.documentElement.scrollTop,
        });
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private whisper(data: ScrollDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
