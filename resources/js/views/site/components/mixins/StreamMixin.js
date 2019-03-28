export default {
  $inject: ["BroadcastService"],
  created() {
    this.setupStream();
  },
  data() {
    return {
      listening: false,
      userIsLive: false,
    };
  },
  methods: {
    setupStream() {
      this.channel = this.broadcastService
        .join(`stream.${this.$route.params.session}`)
        .joining((user) => {
          if (user.guest) {
            this.userIsLive = true;
          }
        })
        .leaving((user) => {
          if (user.guest) {
            this.userIsLive = false;
          }
        })
        .here((usersInChannel) => {
          let hasGuest = usersInChannel.find((guest) => {
            return guest.guest === true;
          });
          if (hasGuest) {
            this.userIsLive = true;
          }
        });
    },
    goLive() {
      if (!this.listening) {
        this.listening = true;
        this.channel
          .listenForWhisper("window-size", (changes) => {
            this.$store.commit("site/guest/session/ADD_EVENT", {
              changes,
              event: "window_size_changes",
            });
            this.updateWindowSize(changes);
          })
          .listenForWhisper("click", (changes) => {
            this.$store.commit("site/guest/session/ADD_EVENT", {
              changes,
              event: "mouse_clicks",
            });
            this.addMouseClick(changes);
          })
          .listenForWhisper("scroll", (changes) => {
            // TODO - this should act like mouse movements, as there will be big groupings
            this.$store.commit("site/guest/session/ADD_EVENT", {
              changes,
              event: "scroll_events",
            });
            this.updateScrollPosition(changes);
          })
          .listenForWhisper("changes", (changes) => {
            this.$store.commit("site/guest/session/ADD_EVENT", {
              changes,
              event: "dom_changes",
            });
            this.updateDom(changes);
          })
          .listenForWhisper("mouse-movement", (changes) => {
            changes.forEach((change) => {
              this.$store.commit("site/guest/session/ADD_EVENT", {
                changes: change,
                event: "mouse_movements",
              });
              change.timing = new Date() - change.timing;
              setTimeout(() => {
                this.updateMouseMovements(change);
              }, new Date() - change.timing);
            });
          })
          .listenForWhisper("network-request", (changes) => {
            this.$store.commit("site/guest/session/ADD_EVENT", {
              changes,
              event: "network_requests",
            });
          })
          .listenForWhisper("console-message", (changes) => {
            this.$store.commit("site/guest/session/ADD_EVENT", {
              changes,
              event: "console_messages",
            });
          });
      }
      this.stop();
      this.seek(this.endTiming);
    },
  },
};
