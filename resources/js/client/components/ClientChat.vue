<template>
  <form @submit.prevent="sendMessage">
    <input type="text" v-model="message" @keyup="showTyping" />
    <template v-for="message in messages">
      <chat-message
        :message="message"
        :current-time="currentTime"
      ></chat-message>
    </template>
    <p>>>{{ peopleAreTyping }}<<</p>
    <button type="submit">Send</button>
  </form>
</template>

<script>
import ChatMessage from "./chat-components/ChatMessage";

const ONE_MIN = 60 * 1000;

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
    isAgent: {
      default: false,
    },
  },
  data() {
    return {
      messages: [],
      message: null,
      currentTime: null,
      peopleTyping: {},
    };
  },
  created() {
    setInterval(() => {
      this.currentTime = new Date();
    }, ONE_MIN);
  },
  watch: {
    channel: {
      immediate: true,
      handler() {
        if (this.channel) {
          this.channel
            .here((users) => {
              console.info(users);
            })
            .joining((user) => {
              if (!user.guest) {
                console.info(`Agent ${user.name} connected.`);
              }
            })
            .listenForWhisper("chat-message", (data) => {
              this.messages.push(data);
            })
            .listenForWhisper("chat-typing", (data) => {
              clearTimeout(this.peopleTyping[data.userName]);
              this.$set(
                this.peopleTyping,
                data.userName,
                setTimeout(() => {
                  this.$delete(this.peopleTyping, data.userName);
                }, 3000),
              );
            });
        }
      },
    },
  },
  methods: {
    showTyping() {
      this.channel.whisper("chat-typing", {
        userName: this.userName,
      });
    },
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
  computed: {
    peopleAreTyping() {
      return Object.keys(this.peopleTyping).length;
    },
  },
};
</script>
