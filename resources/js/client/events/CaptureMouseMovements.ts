import ListenInterface from "../interfaces/ListenInterface";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import MouseMovementDataInterface from "../interfaces/MouseMovementDataInterface";

export default class CaptureMouseMovements implements ListenInterface {
  protected readonly timing: number;
  protected readonly event = "mouse-movement";
  protected readonly channel: NullPresenceChannel;

  private mouseMovementInterval;
  private movements: Array<MouseMovementDataInterface> = [];

  constructor(channel: NullPresenceChannel, timing: number) {
    this.timing = timing;
    this.channel = channel;
  }

  public setup() {
    document.onmousemove = (event: MouseEvent) => {
      this.movements.push({
        x: event.pageX,
        y: event.pageY,
        timing: new Date().getTime() - this.timing,
      });
    };
    this.setupInterval();
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

  public teardown() {
    clearInterval(this.mouseMovementInterval);
  }

  public whisper(data: Array<MouseMovementDataInterface>) {
    this.channel.whisper(this.event, data);
  }
}
