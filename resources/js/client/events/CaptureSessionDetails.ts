import { NullPresenceChannel } from "laravel-echo/dist/channel";
import SessionDetailsDataInterface from "../interfaces/SessionDetailsDataInterface";

export default class CaptureSessionDetails {
  protected userData: object = {};
  protected channel: NullPresenceChannel;
  protected readonly event = "session-details";

  public sendDetails(channel: NullPresenceChannel) {
    this.channel = channel;
    this.whisper(this.userData);
  }

  public set(data: object) {
    this.userData = Object.assign({}, this.userData, data);
  }

  public whisper(data: SessionDetailsDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
