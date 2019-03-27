export default {
  $inject: ["BroadcastService"],
  created() {
    this.setupStream();
  },
  data() {
    return {
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
    connectToStream() {
      this.channel
        .listenForWhisper("window-size", ({ width, height }) => {
          console.info("window-size");
        })
        .listenForWhisper("click", ({ x, y }) => {
          console.info("click");
        })
        .listenForWhisper("scroll", ({ scrollPosition }) => {
          console.info("scroll");
        })
        .listenForWhisper(
          "changes",
          ({ removed, addedOrMoved, attributes, text }) => {
            console.info("changes");
          },
        )
        .listenForWhisper("mouse-movement", (movements) => {
          console.info("mouse-movement");
        })
        .listenForWhisper("network-request", () => {
          console.info("network-request");
        })
        .listenForWhisper("console-message", () => {
          console.info("console-message");
        });
    },
  },
};
