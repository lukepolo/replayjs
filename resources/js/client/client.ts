import AuthService from "./services/AuthService";
import ChatService from "./services/ChatService";
import StreamService from "./services/StreamService";
import WebSocketService from "./services/WebSocketService";
import ChatOptionsInterface from "./interfaces/ChatOptionsInterface";
import StreamOptionsInterface from "./interfaces/StreamOptionsInterface";

declare global {
  interface Window {
    replayjsQueue: Array<any>;
    replayjs: (fn: string, data: any) => void;
  }
}

export default class Client {
  protected authService: AuthService;
  protected chatService: ChatService;
  protected streamService: StreamService;
  protected websocketService: WebSocketService;

  constructor() {
    this.authService = new AuthService();
    this.websocketService = new WebSocketService();

    this.chatService = new ChatService(this.authService, this.websocketService);

    this.streamService = new StreamService(
      this.authService,
      this.websocketService,
    );

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
    await this.authService.identify(apiKey);
  }

  protected stream(options: StreamOptionsInterface = {}) {
    this.checkAuthed(() => {
      this.streamService.connect(options);
    });
  }

  protected chat(options: ChatOptionsInterface = {}) {
    this.checkAuthed(() => {
      this.chatService.connect(options);
    });
  }

  private checkAuthed(callback: () => void) {
    if (this.authService.isAuthed()) {
      return callback();
    }
    throw Error("There was an error connecting you to the client.");
  }
}
new Client();
