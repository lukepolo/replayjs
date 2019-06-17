import Echo from "laravel-echo";
import { injectable, inject } from "inversify";
import { PusherConnector } from "laravel-echo/dist/connector";
import AuthService from "@app/services/AuthService";
import ConfigService from "varie/lib/config/ConfigService";

declare global {
  interface Window {
    Pusher: PusherConnector;
  }
}

@injectable()
export default class BroadcastService {
  protected $echo: Echo;
  protected $authService: AuthService;
  protected $configService: ConfigService;

  constructor(
    @inject("ConfigService") configService,
    @inject("AuthService") authService,
  ) {
    this.$authService = authService;
    this.$configService = configService;
    window.Pusher = require("pusher-js");
  }

  private connect() {
    this.$echo = new Echo({
      broadcaster: "pusher",
      enabledTransports: ["ws", "wss"],
      wsHost: this.$configService.get("app.WS_HOST", null),
      wsPort: this.$configService.get("app.WS_PORT", null),
      key: this.$configService.get("services.PUSHER_APP_KEY", null),
      authEndpoint: `/api/broadcasting/auth`,
      disableStats: true,
      auth: {
        headers: {
          Authorization: `Bearer ${this.$authService.getJwt()}`,
        },
      },
    });
  }

  public listen(channel, event, callback) {
    if (!this.$echo) {
      this.connect();
    }
    return this.$echo.channel("app").listen(event, callback);
  }

  public join(channel: string) {
    if (!this.$echo) {
      this.connect();
    }
    return this.$echo.join(channel);
  }

  public isConnected() {
    return !!this.$echo;
  }
}
