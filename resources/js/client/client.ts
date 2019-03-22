import AuthService from "./services/AuthService";
import WebSocketService from "./services/WebSocketService";
import StreamService from "./services/StreamService";

declare global {
  interface Window {
    replayjsQueue: Array<any>;
    replayjs: (fn: string, data: any) => any;
  }
}

export default class Client {
  protected identity;
  protected authService: AuthService;
  protected streamService: StreamService;
  protected websocketService: WebSocketService;

  constructor() {
    this.authService = new AuthService();
    this.websocketService = new WebSocketService();
    this.streamService = new StreamService(this.websocketService);

    this.runQueued().then(() => {
      this.setupQueue();
    });
  }

  protected async runQueued() {
    if (Array.isArray(window.replayjsQueue)) {
      for (let queue in window.replayjsQueue) {
        let args = window.replayjsQueue[queue];
        if (!this[args[0]]) {
          throw Error(`${args[0]} is an invalid command.`);
        }
        await this[args[0]](args[1]);
      }
    }
  }

  protected setupQueue() {
    delete window.replayjsQueue;
    window.replayjs = async (fn, data) => {
      if (!this[fn]) {
        throw Error(`${fn} is an invalid command.`);
      }
      await this[fn](data);
    };
  }

  protected async auth(apiKey: string) {
    this.websocketService.setApiKey(apiKey);
    this.identity = await this.authService.identify(apiKey);
  }

  protected async stream(options) {
    this.streamService.connect(options);
  }
}
new Client();
