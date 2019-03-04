import { NullPresenceChannel } from "laravel-echo/dist/channel";
import SessionDetailsDataInterface from "../interfaces/SessionDetailsDataInterface";

export default class CaptureSessionDetails {
  protected readonly apiKey: string;
  protected readonly event = "session-details";
  protected readonly channel: NullPresenceChannel;

  constructor(channel: NullPresenceChannel, apiKey: string) {
    this.apiKey = apiKey;
    this.channel = channel;
  }

  public sendDetails() {
    this.whisper({
      apiKey: this.apiKey,
    });
  }

  public whisper(data: SessionDetailsDataInterface) {
    this.channel.whisper(this.event, data);
  }
}
