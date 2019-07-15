import finder from "@medv/finder";
import timing from "../helpers/timing";
import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ScrollDataInterface from "../interfaces/ScrollDataInterface";

export default class CaptureScrollEvents implements ListenInterface {
  protected readonly event = "scroll";
  protected ticking: boolean = false;
  protected channel: NullPresenceChannel;

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    document.addEventListener("scroll", this.scrolled.bind(this), true);
  }

  public teardown() {
    document.removeEventListener("scroll", this.scrolled.bind(this), true);
  }

  private scrolled(event) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.whisper({
          timing: timing(),
          target: finder(event.target, {
            idName: (name) => false,
          }),
          scrollPosition: event.target.scrollTop,
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
