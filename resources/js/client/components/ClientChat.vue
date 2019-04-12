<template>
  <form @submit.prevent="sendMessage">
    <h3>Agents Here</h3>
    {{ agents }}
    <h3>Guests</h3>
    {{ guests }}

    <input type="text" v-model="message" @keyup="showTyping" />
    <template v-for="message in previousMessages">
      <chat-message
        :message="message"
        :current-time="currentTime"
      ></chat-message>
    </template>
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
    userData: {
      required: true,
    },
    isAgent: {
      default: false,
    },
    previousMessages: {
      required: true,
    },
  },
  data() {
    return {
      users: [],
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
              this.users = users;
            })
            .joining((user) => {
              this.users.push(user);
            })
            .leaving((user) => {
              let userIndex = this.users.indexOf(user);
              if (userIndex !== -1) {
                this.$delete(this.users, userIndex);
              }
            })
            .listenForWhisper("chat-message", (data) => {
              this.messages.push(data);
            })
            .listenForWhisper("chat-typing", (data) => {
              clearTimeout(this.peopleTyping[data.user.hash]);
              this.$set(
                this.peopleTyping,
                data.user.hash,
                setTimeout(() => {
                  this.$delete(this.peopleTyping, data.user.hash);
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
        user: this.userData,
      });
    },
    sendMessage() {
      let message = {
        user: this.userData,
        message: this.message,
        isAgent: this.isAgent,
        createdAt: Date.now(),
      };
      this.channel.whisper("chat-message", message);
      this.messages.push(message);
      this.message = null;
    },
  },
  computed: {
    agents() {
      return this.users.filter((user) => {
        return !user.guest;
      });
    },
    guests() {
      return this.users.filter((user) => {
        return user.guest;
      });
    },
    peopleAreTyping() {
      return Object.keys(this.peopleTyping).length;
    },
  },
};
</script>
