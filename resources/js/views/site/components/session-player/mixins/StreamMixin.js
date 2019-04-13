import { playerEventTypes } from "@app/constants/playerEventTypes";
import { playerEventMirrorFunctions } from "@app/constants/playerEventMirrorFunctions";

export default {
  $inject: ["BroadcastService"],
  created() {
    this._setupStream();
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
    _addEvent(event, changes, queueFunction) {
      this.$store.dispatch("site/guest/session/addEvent", {
        event,
        changes,
      });

      if (queueFunction) {
        this.queueChanges(
          this._groupByTiming(changes),
          queueFunction,
          this.watchingLive,
        );
      }

      this.sessionPlayerEventsWorker.postMessage({
        event: "addEvent",
        data: {
          type: event,
          timing: changes.timing,
        },
      });

      this.sessionPlayerActivityWorker.postMessage({
        event: "addActivity",
        data: {
          timing: changes.timing,
        },
      });
    },
    _groupByTiming(changes) {
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
    _setupStream() {
      this.channel = this.broadcastService
        .join(`stream.${this.$route.params.session}`)
        .here(() => {
          // TODO - they may already be here
        })
        .joining((user) => {
          console.info(user);
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
              .listenForWhisper("click", (changes) => {
                this._addEvent(
                  playerEventTypes.MouseClick,
                  changes,
                  playerEventMirrorFunctions.MouseClick,
                );
              })
              .listenForWhisper("window-size", (changes) => {
                this._addEvent(
                  playerEventTypes.WindowSize,
                  changes,
                  playerEventMirrorFunctions.WindowSize,
                );
              })
              .listenForWhisper("scroll", (changes) => {
                this._addEvent(
                  playerEventTypes.Scroll,
                  changes,
                  playerEventMirrorFunctions.Scroll,
                );
              })
              .listenForWhisper("initialize", (changes) => {
                this._addEvent(
                  playerEventTypes.DomChange,
                  changes,
                  playerEventMirrorFunctions.DomChange,
                );
              })
              .listenForWhisper("changes", (changes) => {
                this._addEvent(
                  playerEventTypes.DomChange,
                  changes,
                  playerEventMirrorFunctions.DomChange,
                );
              })
              .listenForWhisper("mouse-movement", (changes) => {
                this._addEvent(
                  playerEventTypes.MouseMovement,
                  changes,
                  playerEventMirrorFunctions.MouseMovement,
                );
              })
              .listenForWhisper("focus-activity", (changes) => {
                this._addEvent(playerEventTypes.FocusActivity, changes);
              })
              .listenForWhisper("tab-visibility", (changes) => {
                this._addEvent(playerEventTypes.TabVisibility, changes);
              })
              .listenForWhisper("network-request", (changes) => {
                this._addEvent(playerEventTypes.NetworkRequest, changes);
              })
              .listenForWhisper("console-message", (changes) => {
                this._addEvent(playerEventTypes.ConsoleMessage, changes);
              });
          }
        });
    },
  },
};
