import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import MouseMovementDataInterface from "../interfaces/MouseMovementDataInterface";

export default class CaptureMouseMovements implements ListenInterface {
  protected readonly timing: number;
  protected channel: NullPresenceChannel;
  protected readonly event = "mouse-movement";

  private mouseMovementInterval;
  private movements: Array<MouseMovementDataInterface> = [];

  constructor(timing: number) {
    this.timing = timing;
  }

  public setup(channel: NullPresenceChannel) {
    this.channel = channel;
    window.addEventListener("mousemove", this.mouseMovement.bind(this));
    this.setupInterval();
  }

  public teardown() {
    clearInterval(this.mouseMovementInterval);
    window.removeEventListener("mousemove", this.mouseMovement.bind(this));
  }

  private mouseMovement(event: MouseEvent) {
    this.movements.push({
      x: event.pageX,
      y: event.pageY,
      timing: new Date().getTime() - this.timing,
    });
  }

  private setupInterval() {
    setTimeout(() => {
      this.mouseMovementInterval = setInterval(() => {
        if (this.movements.length) {
          this.whisper(this.movements);
          this.movements = [];
        }
      }, 1000);
    }, 0);
  }

  private whisper(data: Array<MouseMovementDataInterface>) {
    this.channel.whisper(this.event, data);
  }
}
