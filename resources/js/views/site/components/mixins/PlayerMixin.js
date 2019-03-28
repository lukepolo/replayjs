export default {
  data() {
    return {
      isLoading: true,
      timeInterval: null,
      timeoutUpdates: [],
      currentTimePosition: 0,
    };
  },
  methods: {
    async initializePlayer() {
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

      this.isLoading = false;
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
      // TODO - how todo this better?
      this.timeInterval = setInterval(() => {
        if (this.currentTimePosition > this.endTiming) {
          return this.stop();
        }
        this.currentTimePosition = this.currentTimePosition + 100;
      }, 100);
    },
    stop() {
      this.watchingLive = false;
      this.timeoutUpdates.forEach((timeout, index) => {
        clearTimeout(timeout);
        delete this.timeoutUpdates[index];
      });
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    },
  },
  computed: {
    rootDom() {
      return this.session.root;
    },
    rootWindowSize() {
      return this.session.window_size;
    },
    domChanges() {
      return this.session.dom_changes;
    },
    mouseClicks() {
      return this.session.mouse_clicks;
    },
    mouseMovements() {
      return this.session.mouse_movements;
    },
    scrollEvents() {
      return this.session.scroll_events;
    },
    windowSizeChanges() {
      return this.session.window_size_changes;
    },
    startTiming() {
      // TODO - needs to be done via JS
      return this.session.start_timing;
    },
    endTiming() {
      // TODO - needs to be done via JS
      return this.session.end_timing;
    },
    isPlaying() {
      return this.timeInterval !== null;
    },
  },
};
