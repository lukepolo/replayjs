export default {
  $inject: ["BroadcastService"],
  created() {
    this.setupStream();
  },
  data() {
    return {
      userIsLive: false,
      watchingLive: false,
    };
  },
  methods: {
    goLive() {
      this.stop();
      this.seek(this.endTiming);
      this.watchingLive = true;
    },
    groupByTiming(changes) {
      let finalChanges = {};
      if (Array.isArray(changes)) {
        changes.forEach((change) => {
          if (!finalChanges[change.timing]) {
            finalChanges[change.timing] = [];
          }
          finalChanges[change.timing].push(change);
        });
      } else {
        finalChanges[changes.timing] = [changes];
      }
      return finalChanges;
    },
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
            this.channel
              .listenForWhisper("window-size", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "window_size_changes",
                });
                this.queueChanges(
                  this.groupByTiming(changes),
                  "updateWindowSize",
                  this.watchingLive,
                );
              })
              .listenForWhisper("click", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "mouse_clicks",
                });
                this.queueChanges(
                  this.groupByTiming(changes),
                  "addMouseClick",
                  this.watchingLive,
                );
              })
              .listenForWhisper("scroll", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "scroll_events",
                });
                this.queueChanges(
                  this.groupByTiming(changes),
                  "updateScrollPosition",
                  this.watchingLive,
                );
              })
              .listenForWhisper("initialize", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "dom_changes",
                });
                this.queueChanges(
                  this.groupByTiming(changes),
                  "updateDom",
                  this.watchingLive,
                );
              })
              .listenForWhisper("changes", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "dom_changes",
                });
                this.queueChanges(
                  this.groupByTiming(changes),
                  "updateDom",
                  this.watchingLive,
                );
              })
              .listenForWhisper("mouse-movement", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes: changes,
                  event: "mouse_movements",
                });
                this.queueChanges(
                  this.groupByTiming(changes),
                  "updateMouseMovement",
                  this.watchingLive,
                );
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
        });
    },
  },
};
