<template>
  <div>
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script>
export default {
  props: {
    channel: {
      required: true,
    },
  },
  mounted() {
    this.channel.listenForWhisper("chat-message", (changes) => {
      console.info("we got a message");
    });
  },
  methods: {
    sendMessage() {
      console.info("sending message");
      this.channel.whisper("chat-message", {
        message: "test",
      });
    },
  },
};
</script>
