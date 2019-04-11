<template>
  <form @submit.prevent="sendMessage">
    <input type="text" v-model="message" />
    <template v-for="message in messages">
      <chat-message
        :message="message"
        :current-time="currentTime"
      ></chat-message>
    </template>
    <button type="submit">Send</button>
  </form>
</template>

<script>
import ChatMessage from "./chat-components/ChatMessage";
export default {
  components: {
    ChatMessage,
  },
  props: {
    channel: {
      required: true,
    },
    userName: {
      required: true,
    },
  },
  data() {
    return {
      messages: [],
      message: null,
      currentTime: null,
    };
  },
  created() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  watch: {
    channel: {
      immediate: true,
      handler() {
        console.info(this.userName);
        if (this.channel) {
          console.info("REGISTER");
          this.channel
            .here(() => {
              console.info("joined!");
            })
            .listenForWhisper("chat-message", (data) => {
              this.messages.push(data);
            });
        }
      },
    },
  },
  methods: {
    sendMessage() {
      let message = {
        message: this.message,
        userName: this.userName,
        createdAt: new Date().getTime(),
      };
      this.channel.whisper("chat-message", message);
      this.messages.push(message);
      this.message = null;
    },
  },
};
</script>
