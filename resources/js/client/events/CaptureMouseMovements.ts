import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import MouseMovementDataInterface from "../interfaces/MouseMovementDataInterface";

export default class CaptureMouseMovements implements ListenInterface {
  protected readonly timing: number;
  protected channel: NullPresenceChannel;
  protected readonly event = "mouse-movement";

  constructor(timing: number) {
    this.timing = timing;
  }

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    window.addEventListener("mousemove", this.mouseMovement.bind(this));
  }

  public teardown() {
    window.removeEventListener("mousemove", this.mouseMovement.bind(this));
  }

  private mouseMovement(event: MouseEvent) {
    this.whisper({
      x: event.pageX,
      y: event.pageY,
      timing: new Date().getTime() - this.timing,
    });
  }

  private whisper(data: MouseMovementDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
