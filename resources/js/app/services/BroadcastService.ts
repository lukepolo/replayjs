import Echo from "laravel-echo";
import { injectable, inject } from "inversify";

@injectable()
export default class BroadcastService {
  protected $echo: Echo;

  constructor(@inject("ConfigService") configService) {
    // @ts-ignore
    window.Pusher = require("pusher-js");
    this.$echo = new Echo({
      broadcaster: "pusher",
      wsHost: configService.get("app.WS_HOST"),
      wsPort: configService.get("app.WS_PORT"),
      key: configService.get("services.PUSHER_APP_KEY"),
      authEndpoint: `${__ENV_VARIABLES__.app.APP_URL}/api/broadcasting/auth`,
      disableStats: true,
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
