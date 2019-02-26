<template>
  <section>
    <div class="flex-center position-ref full-height" style="height : 300000px">
      <div class="content">
        <pre>{{ isTyping }}</pre>
        <div>
          <template v-for="message in messages">
            <p>
              {{ message.user.name }} : {{ message.message }} <br />
              <small>{{ message.time }}</small>
            </p>
          </template>
          <template v-if="isTyping">
            ...
          </template>
        </div>
        <form @submit.prevent="sendMessage">
          <textarea
            name="message"
            v-model="form.message"
            @keyup="typing"
            @keyup.enter="sendMessage"
          ></textarea>
          <button class="pusher-chat-widget-send-btn">Send</button>
        </form>
        <br />
        <br />
        <input type="text" value="123" />
        <br />
        <br />
        <select>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <select>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <br />
        <br />
        <br />
        <label> <input type="checkbox" value="123" /> Checkbox </label>
        <br />
        <label> <input type="radio" name="abc" value="1" /> Radio 1 </label>
        <label> <input type="radio" name="abc" value="2" /> Radio 2 </label>

        <br /><br />
        <textarea name="test">Testing 123</textarea>
      </div>
    </div>
  </section>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  $inject: ["BroadcastService", "HttpService"],
  data() {
    return {
      form: {
        message: "WOOO ITS A MESSAGE",
      },
      isTyping: null,
      messages: [],
      user: new Date(),
    };
  },
  mounted() {
    this.channel = this.broadcastService
      .join(`chat`)
      .listen("NewChatMessage", (e) => {
        this.messages.push(e.message);
      })
      .listenForWhisper("typing", (e) => {
        this.isTyping = e.user;
        setTimeout(() => {
          this.isTyping = null;
        }, 3000);
      });

    let client = document.createElement("script");
    client.src = "http://replayjs.test:3000/js/client.js";
    this.$el.append(client);
  },
  methods: {
    typing() {
      this.channel.whisper("typing", {
        user: this.user,
      });
    },
    sendMessage() {
      this.httpService
        .post("/api/support/messages", this.form)
        .then((message) => {
          this.form.message = null;
          this.messages.push(message.data);
        });
    },
  },
});
</script>
