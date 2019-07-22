import finder from "@medv/finder";
import timing from "../../helpers/timing";
import ListenInterface from "../../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ScrollDataInterface from "../../interfaces/ScrollDataInterface";

// TODO - capture x scroll
export default class CaptureScrollEvents implements ListenInterface {
  protected readonly event = "scroll";
  protected channel: NullPresenceChannel;

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    document.addEventListener("scroll", this.scrolled.bind(this), true);
  }

  public teardown() {
    document.removeEventListener("scroll", this.scrolled.bind(this), true);
  }

  private scrolled(event) {
    this.whisper({
      timing: timing(),
      target: finder(event.target),
      scrollPosition: event.target.scrollTop,
    });
  }

  private whisper(data: ScrollDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
