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
                if (this.watchingLive) {
                  this.updateWindowSize(changes);
                } else {
                  // TODO - these changes need to be keyed by timing
                  // this.queueChanges(changes, "updateWindowSize");
                }
              })
              .listenForWhisper("click", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "mouse_clicks",
                });
                if (this.watchingLive) {
                  this.addMouseClick(changes);
                } else {
                  // TODO - these changes need to be keyed by timing
                  // this.queueChanges(changes, "addMouseClick");
                }
              })
              .listenForWhisper("scroll", (changes) => {
                // TODO - this should act like mouse movements, as there will be big groupings
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "scroll_events",
                });
                if (this.watchingLive) {
                  this.updateScrollPosition(changes);
                } else {
                  // TODO - these changes need to be keyed by timing
                  // this.queueChanges(this.scrollEvents, "updateScrollPosition");
                }
              })
              .listenForWhisper("changes", (changes) => {
                this.$store.commit("site/guest/session/ADD_EVENT", {
                  changes,
                  event: "dom_changes",
                });
                if (this.watchingLive) {
                  this.updateDom(changes);
                } else {
                  // TODO - these changes need to be keyed by timing
                  // this.queueChanges(this.domChanges, "updateDom");
                }
              })
              .listenForWhisper("mouse-movement", (changes) => {
                let startTiming = changes[0].timing;
                changes.forEach((change) => {
                  this.$store.commit("site/guest/session/ADD_EVENT", {
                    changes: change,
                    event: "mouse_movements",
                  });
                  if (this.watchingLive) {
                    setTimeout(() => {
                      this.updateMouseMovements(change);
                    }, change.timing - startTiming);
                  } else {
                    // TODO - these changes need to be keyed by timing
                    // this.queueChanges(this.mouseMovements, "updateMouseMovements");
                  }
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
        });
    },
    goLive() {
      this.stop();
      this.watchingLive = true;
      this.seek(this.endTiming);
    },
  },
};
