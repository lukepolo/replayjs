<template>
  <div class="replay-chat" :class="{ 'client-styles': !isAgent }">
    <div class="chat__header">
      <div class="chat__header-actions"></div>
      <div>
        <template v-if="isAgent">
          <h3>Guests</h3>
          {{ guests }}
        </template>
        <template v-else>
          <template v-for="agent in agents">
            <div class="agent">
              <div class="agent__avatar">
                <img src="./../../../../resources/images/temp_avatar.svg" />
              </div>
              <div class="agent__name">
                <div>
                  {{ agent.name }}
                </div>
                <small>Support Staff</small>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>

    <div class="chat__content" ref="content">
      <template v-for="message in previousMessages">
        <chat-message
          :class="{ left: message.user.isAgent, right: !message.user.isAgent }"
          :message="message"
          :current-time="currentTime"
        ></chat-message>
      </template>
      <template v-for="message in messages">
        <pre>{{ message.user }}</pre>
        <chat-message
          :message="message"
          :current-time="currentTime"
        ></chat-message>
      </template>
      <template v-for="user in usersTyping">
        <pre>{{ user.name }}</pre>
        ....
      </template>
    </div>

    <div class="chat__footer">
      <form @submit.prevent="sendMessage">
        <div class="chat__input-area">
          <div class="chat__input-area-input">
            <input
              placeholder="Write a message..."
              type="text"
              v-model="message"
              @keyup="showTyping"
            />
          </div>
          <div class="chat__input-area-actions">
            actions
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.client-styles {
  position: fixed;
  right: 10px;
  bottom: 10px;
  width: 350px;
  height: 652px;

  overflow: hidden;
  border: 1px solid #f5f3f3;
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 2px 3px 1px #f5f3f3;

  display: flex;
  flex-direction: column;

  .chat {
    &__header {
      z-index: 1;
      padding: 10px;
      border-bottom: 1px solid #f5f3f3;
      box-shadow: 0 0 1px 1px darken(#f5f3f3, 5%);
    }

    &__content {
      padding: 10px;
      overflow-y: auto;
      background-color: #f5f3f3;
    }

    &__footer {
      border-top: 1px solid #f5f3f3;
    }

    &__input-area {
      z-index: 1;
      display: flex;
      &-input {
        flex: 1 1 auto;
        input {
          border-bottom-left-radius: 5px;
          padding: 10px 5px;
          border: 1px solid transparent;
          width: 100%;
          &::placeholder {
            color: darken(#f5f3f3, 15%);
          }

          &:focus {
            outline: none;
          }
        }
      }
      &-actions {
      }
    }
  }
}

.agent {
  display: flex;
  align-items: flex-end;

  &__avatar,
  &__avatar img {
    width: 50px;
    height: 50px;
  }

  &__name {
    margin: 5px 10px;
    text-transform: capitalize;
  }
}
</style>

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
      usersTyping: {},
    };
  },
  created() {
    setInterval(() => {
      this.currentTime = new Date();
    }, ONE_MIN);
  },
  mounted() {
    this.scrollToBottom(true);
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
              this.removePersonTyping(data.user.hash);
              this.messages.push(data);
              this.scrollToBottom();
            })
            .listenForWhisper("chat-typing", (data) => {
              if (this.usersTyping[data.user.hash]) {
                clearTimeout(this.usersTyping[data.user.hash].timeout);
              }
              this.$set(this.usersTyping, data.user.hash, {
                name: data.user.name,
                timeout: setTimeout(() => {
                  this.removePersonTyping(data.user.hash);
                }, 3000),
              });
              this.scrollToBottom();
            });
        }
      },
    },
  },
  methods: {
    showTyping(event) {
      if (event.key !== "Enter") {
        this.channel.whisper("chat-typing", {
          user: this.userData,
        });
      }
    },
    isScrolledToBottom() {
      let elm = this.$refs["content"];
      return elm.scrollTop === elm.scrollHeight - elm.offsetHeight;
    },
    scrollToBottom(force = false) {
      if (force || this.isScrolledToBottom()) {
        let elm = this.$refs["content"];
        setTimeout(() => {
          elm.scrollTop = elm.scrollHeight - elm.offsetHeight;
        });
      }
    },
    removePersonTyping(userHash) {
      this.$delete(this.usersTyping, userHash);
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
      this.scrollToBottom(true);
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
  },
};
</script>
