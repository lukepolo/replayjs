<template>
  <form @submit.prevent="sendMessage">
    <input type="text" v-model="message" />
    <template v-for="message in messages">
      <pre>{{ message.userName }}: {{ message.message }}</pre>
    </template>
    <button type="submit">Send</button>
  </form>
</template>

<script>
export default {
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
      message: null,
      messages: [],
    };
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
      };
      this.channel.whisper("chat-message", message);
      this.messages.push(message);
      this.message = null;
    },
  },
};
</script>
