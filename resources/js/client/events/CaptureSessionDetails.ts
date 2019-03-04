import { NullPresenceChannel } from "laravel-echo/dist/channel";
import SessionDetailsDataInterface from "../interfaces/SessionDetailsDataInterface";

export default class CaptureSessionDetails {
  protected userData: object = {};
  protected readonly apiKey: string;
  protected channel: NullPresenceChannel;
  protected readonly event = "session-details";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public sendDetails(channel: NullPresenceChannel) {
    this.channel = channel;
    this.whisper(
      Object.assign(
        {
          apiKey: this.apiKey,
        },
        this.userData,
      ),
    );
  }

  public set(data: object) {
    this.userData = Object.assign({}, this.userData, data);
  }

  public whisper(data: SessionDetailsDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
