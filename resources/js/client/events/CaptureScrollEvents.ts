import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ScrollDataInterface from "../interfaces/ScrollDataInterface";

export default class CaptureScrollEvents implements ListenInterface {
  protected readonly event = "scroll";
  protected ticking: boolean = false;
  protected channel: NullPresenceChannel;

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    window.addEventListener("scroll", this.scrolled.bind(this));
  }

  public teardown() {
    window.removeEventListener("scroll", this.scrolled.bind(this));
  }

  private scrolled(event) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.whisper({
          target: event.target,
          timing: new Date().getTime(),
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
