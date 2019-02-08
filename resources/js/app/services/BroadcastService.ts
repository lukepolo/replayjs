import Echo from "laravel-echo";
import { injectable, inject } from "inversify";

@injectable()
export default class BroadcastService {
  protected $echo: Echo;

  constructor(@inject("ConfigService") configService) {
    // @ts-ignore
    window.io = require("socket.io-client");
    this.$echo = new Echo({
      broadcaster: "socket.io",
      key: configService.get("services.PUSHER_APP_KEY"),
      host:
        configService.get("app.ENV") === "local"
          ? `${window.location.hostname}:6001`
          : "https://ws.replayjs.io:6001",
    });
  }

  public listen(channel, event, callback) {
    return this.$echo.channel("app").listen(event, callback);
  }

  public join(channel: string) {
    return this.$echo.join(channel);
  }

  public isConnected() {
    return this.$echo.connector.socket.connected;
  }
}
