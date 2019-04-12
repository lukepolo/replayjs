import Vue from "vue";
import AuthService from "./AuthService";
import WebSocketService from "./WebSocketService";
import ClientChat from "../components/ClientChat.vue";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ChatOptionsInterface from "../interfaces/ChatOptionsInterface";

export default class ChatService {
  protected authService: AuthService;
  protected channel: NullPresenceChannel;
  protected webSocketService: WebSocketService;

  private chatElement;

  constructor(authService: AuthService, webSocketService: WebSocketService) {
    this.authService = authService;
    this.webSocketService = webSocketService;
  }

  public connect(options: ChatOptionsInterface = {}) {
    this.webSocketService.connect().then((channel) => {
      this.channel = channel
        .join(`chat.${this.authService.getGuest().hash}`)
        .here(() => {
          // TODO - they should pass options for this , GET FROM API?
          this.show();
        })
        .joining(() => {});
    });
  }

  public show() {
    this.chatElement = document.createElement("div");
    this.chatElement.id = "replayjs-chat";
    document.body.appendChild(this.chatElement);
    new Vue({
      render: (h) =>
        h(ClientChat, {
          props: {
            channel: this.channel,
            userData: this.authService.getGuest(),
            previousMessages: this.authService.getGuest()["chat-messages"],
          },
        }),
    }).$mount(this.chatElement);
  }

  public hide() {
    // TODO - hide element
  }

  protected disconnect() {
    // TODO - delete element
  }
}
