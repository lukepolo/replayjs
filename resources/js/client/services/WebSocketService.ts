import Echo from "laravel-echo";

window.Pusher = require("pusher-js");

export default class WebSocketService {
  public connection: Echo;

  protected apiKey: string;
  protected session: string;
  protected queuedConnections = [];
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
    if (!this.connection) {
      this.createConnection();
    }

    if (this.isAuthenticated()) {
      return callback(this.connection);
    }

    this.queuedConnections.push(callback);
  }

  public disconnect() {
    this.connection.disconnect();
    this.queuedConnections = [];
    this.connection = null;
  }

  public isAuthenticated() {
    return this.getSession();
  }

  private createConnection() {
    this.connection = new Echo({
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

    this.connection.connector.pusher.bind("auth", ({ guest, session }) => {
      console.info(guest);
      this.guest = guest;
      this.session = session;
      this.queuedConnections.forEach((callback) => {
        callback(this.connection);
      });
    });
  }
}
