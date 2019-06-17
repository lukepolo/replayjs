import Vue from "vue";
import WebSocketService from "./WebSocketService";
import ClientChat from "../components/ClientChat.vue";
import { NullPresenceChannel } from "laravel-echo/dist/channel";
import ChatOptionsInterface from "../interfaces/ChatOptionsInterface";

export default class ChatService {
  protected channel: NullPresenceChannel;
  protected webSocketService: WebSocketService;

  private chatElement;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  public connect(options: ChatOptionsInterface = {}) {
    this.webSocketService.connect((channel) => {
      this.channel = channel
        .join(`chat.${this.webSocketService.getGuest().hash}`)
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
            userData: this.webSocketService.getGuest(),
            previousMessages: this.webSocketService.getGuest()["chat-messages"],
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
