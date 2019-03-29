export default {
  data() {
    return {
      isLoading: true,
      timeInterval: null,
      timeoutUpdates: [],
      currentTimePosition: null,
    };
  },
  watch: {
    startTiming(startTiming) {
      this.currentTimePosition = startTiming;
    },
  },
  methods: {
    initializePlayer() {
      this.isLoading = true;
      this.stop();
      this.queuedEvents = {};

      this.setupIframe(this.rootDom);
      this.updateWindowSize(this.rootWindowSize);

      this.queueChanges(this.domChanges, "updateDom", true);
      this.queueChanges(this.mouseClicks, "addMouseClick");
      this.queueChanges(this.scrollEvents, "updateScrollPosition", true);
      this.queueChanges(this.windowSizeChanges, "updateWindowSize", true);
      this.queueChanges(this.mouseMovements, "updateMouseMovement", true);
      setTimeout(() => {
        this.isLoading = false;
      }, 0);
    },
    seek(seekTo) {
      let wasPlaying = this.isPlaying;
      if (this.isPlaying) {
        this.stop();
      }
      this.currentTimePosition = seekTo;
      this.initializePlayer(seekTo);
      if (wasPlaying) {
        this.play();
      }
    },
    play() {
      for (let timing in this.queuedEvents) {
        let queuedEvents = this.queuedEvents[timing];
        this.timeoutUpdates.push(
          setTimeout(() => {
            queuedEvents.forEach(({ event, change }) => {
              this[event](change);
              delete this.queuedEvents[timing];
            });
          }, timing - this.currentTimePosition),
        );
      }
      this.timeInterval = this.requestAnimationInterval(() => {
        this.currentTimePosition = this.currentTimePosition + 10;
        if (this.currentTimePosition > this.endTiming) {
          this.stop();
        }
      });
    },
    stop() {
      this.watchingLive = false;
      this.timeoutUpdates.forEach((timeout, index) => {
        clearTimeout(timeout);
        delete this.timeoutUpdates[index];
      });

      if (this.timeInterval) {
        this.timeInterval.stop();
        this.timeInterval = null;
      }
    },
  },
  computed: {
    rootDom() {
      return this.session && this.session.root;
    },
    rootWindowSize() {
      return this.session && this.session.window_size;
    },
    domChanges() {
      return this.session && this.session.dom_changes;
    },
    mouseClicks() {
      return this.session && this.session.mouse_clicks;
    },
    mouseMovements() {
      return this.session && this.session.mouse_movements;
    },
    scrollEvents() {
      return this.session && this.session.scroll_events;
    },
    windowSizeChanges() {
      return this.session && this.session.window_size_changes;
    },
    consoleMessages() {
      return this.session && this.session.console_messages;
    },
    networkRequests() {
      return this.session && this.session.network_requests;
    },
    startTiming() {
      return this.rootDom && this.rootDom.timing;
    },
    endTiming() {
      if (this.startTiming) {
        let numbers = [
          Object.keys(this.domChanges)[Object.keys(this.domChanges).length - 1],
          Object.keys(this.mouseClicks)[
            Object.keys(this.mouseClicks).length - 1
          ],
          Object.keys(this.networkRequests)[
            Object.keys(this.networkRequests).length - 1
          ],
          Object.keys(this.consoleMessages)[
            Object.keys(this.consoleMessages).length - 1
          ],
          Object.keys(this.windowSizeChanges)[
            Object.keys(this.windowSizeChanges).length - 1
          ],
          Object.keys(this.scrollEvents)[
            Object.keys(this.scrollEvents).length - 1
          ],
          Object.keys(this.mouseMovements)[
            Object.keys(this.mouseMovements).length - 1
          ],
        ].filter((value) => {
          return value !== undefined;
        });

        let endTiming = Math.max(...numbers);
        if (this.watchingLive) {
          this.currentTimePosition = endTiming;
        }
        return endTiming;
      }
    },
    isPlaying() {
      return this.timeInterval !== null;
    },
  },
};
