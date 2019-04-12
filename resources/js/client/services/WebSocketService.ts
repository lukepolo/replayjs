declare global {
  interface Window {
    Pusher: PusherConnector;
  }
}

import Echo from "laravel-echo";
import { PusherConnector } from "laravel-echo/dist/connector";

window.Pusher = require("pusher-js");

export default class WebSocketService {
  public channel: Echo;
  protected apiKey: string;
  protected session: string;
  protected guest: {
    hash: string;
    name: string;
    email: string;
  };

  public auth(apiKey) {
    this.apiKey = apiKey;
  }

  public getSession() {
    return this.session;
  }

  public getGuest() {
    return this.guest;
  }

  public connect(callback: (Echo) => void) {
    if (!this.channel) {
      this.channel = new Echo({
        broadcaster: "pusher",
        enabledTransports: ["ws", "wss"],
        wsHost: __ENV_VARIABLES__.app.WS_HOST,
        wsPort: __ENV_VARIABLES__.app.WS_PORT,
        key: `${__ENV_VARIABLES__.services.PUSHER_APP_KEY}/${this.apiKey}`,
        authEndpoint: `${__ENV_VARIABLES__.app.APP_URL}/api/broadcasting/auth`,
        disableStats: true,
        auth: {
          headers: {
            Authorization: "Bearer " + this.apiKey,
          },
        },
      });

      this.channel.connector.pusher.bind("auth", (data) => {
        this.session = data.session;
        this.guest = data.guest;
        callback(this.channel);
      });
      return;
    }
    callback(this.channel);
  }

  public disconnect() {
    this.channel.disconnect();
    this.channel = null;
  }
}
