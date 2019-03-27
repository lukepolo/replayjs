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
    async initializePlayer(startTime) {
      this.isLoading = true;
      this.stop();
      this.queuedEvents = {};

      this.setupIframe(this.rootDom);
      this.updateWindowSize(this.rootWindowSize);

      this.currentTimePosition = startTime || 0;

      await this.queueChanges(this.domChanges, "updateDom", true);
      await this.queueChanges(this.mouseClicks, "addMouseClick");
      await this.queueChanges(this.scrollEvents, "updateScrollPosition", true);
      await this.queueChanges(this.windowSizeChanges, "updateWindowSize", true);
      await this.queueChanges(
        this.mouseMovements,
        "updateMouseMovements",
        true,
      );

      this.isLoading = false;
    },
    seek(startTime) {
      let wasPlaying = this.isPlaying;
      if (this.isPlaying) {
        this.stop();
      }
      this.currentTimePosition = startTime;
      this.initializePlayer(startTime);
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
      this.timeInterval = setInterval(() => {
        this.currentTimePosition = this.currentTimePosition + 100;
      }, 100);
    },
    stop() {
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
      return this.rootDom && this.rootDom.timing;
    },
    endTiming() {
      let keys = Object.keys(this.domChanges);
      return keys[keys.length - 1];
    },
    isPlaying() {
      return this.timeInterval !== null;
    },
  },
};
