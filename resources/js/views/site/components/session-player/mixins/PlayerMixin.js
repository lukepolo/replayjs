export default {
  data() {
    return {
      skipping: false,
      isLoading: true,
      playbackSpeed: 1,
      queuedEvents: {},
      currentTime: null,
      timeInterval: null,
      timeoutUpdates: [],
      skipThreshold: 3000,
      skipInactivity: true,
    };
  },
  watch: {
    startingTime(startingTime) {
      this.currentTime = startingTime;
    },
  },
  methods: {
    changePlaybackSpeed(speed) {
      this.stop();
      this.playbackSpeed = speed;
      this.play();
    },
    initializePlayer() {
      this.isLoading = true;
      this.stop();

      this.setupIframe(this.rootDom);
      this.updateWindowSize(this.rootWindowSize);

      this.queueEvents();

      setTimeout(() => {
        this.isLoading = false;
      }, 0);
    },
    queueEvents() {
      this.queuedEvents = {};
      this.queueChanges(this.domChanges, "updateDom", true);
      this.queueChanges(this.mouseClicks, "addMouseClick");
      this.queueChanges(this.scrollEvents, "updateScrollPosition", true);
      this.queueChanges(this.windowSizeChanges, "updateWindowSize", true);
      this.queueChanges(this.mouseMovements, "updateMouseMovement", true);
    },
    seek(seekTo) {
      let wasPlaying = this.isPlaying;
      if (this.isPlaying) {
        this.stop();
      }
      this.currentTime = seekTo;
      this.initializePlayer(seekTo);
      if (wasPlaying) {
        this.play();
      }
    },
    play() {
      this.queuedEvents = Object.assign({}, this.queuedEvents);

      for (let timing in this.queuedEvents) {
        let queuedEvents = this.queuedEvents[timing];
        this.timeoutUpdates.push(
          setTimeout(() => {
            queuedEvents.forEach(({ event, change }) => {
              this[event](change);
              this.$delete(this.queuedEvents, timing);
            });
          }, (timing - this.currentTime) * (1 / this.playbackSpeed)),
        );
      }

      let playbackSpeed = 100 * this.playbackSpeed;
      this.timeInterval = this.requestAnimationInterval(() => {
        this.currentTime = this.currentTime + playbackSpeed;
        if (this.currentTime > this.endTiming) {
          this.stop();
        }

        if (
          !this.skipping &&
          this.skipInactivity &&
          !this.watchingLive &&
          this.nextEventTime - this.currentTime > this.skipThreshold
        ) {
          this.skipping = true;
          setTimeout(() => {
            this.stop();
            this.currentTime = this.nextEventTime - this.skipThreshold;
            this.queueEvents();
            this.play();
            this.skipping = false;
          }, this.skipThreshold);
        }
      }, 100);
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
    nextEventTime() {
      let queuedEvents = this.queuedEvents;
      return Object.keys(queuedEvents)[0];
    },
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
    startingTime() {
      return this.rootDom && this.rootDom.timing;
    },
    endingTime() {
      if (this.startingTime) {
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
          this.currentTime = endTiming;
        }
        return endTiming;
      }
    },
    isPlaying() {
      return this.timeInterval !== null;
    },
  },
};
