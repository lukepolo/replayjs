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
  protected chatService: ChatService;
  protected streamService: StreamService;
  protected websocketService: WebSocketService;

  constructor() {
    this.websocketService = new WebSocketService();

    this.chatService = new ChatService(this.websocketService);

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
    this.websocketService.auth(apiKey);
  }

  protected stream(options: StreamOptionsInterface = {}) {
    this.streamService.connect(options);
  }

  protected chat(options: ChatOptionsInterface = {}) {
    this.chatService.connect(options);
  }
}
new Client();
