export default {
  data() {
    return {
      timeInterval: null,
      timeoutUpdates: [],
      currentTimePosition: 0,
    };
  },
  methods: {
    initializePlayer(startTime) {
      this.stop();
      this.queuedEvents = {};

      this.setupMirror(this.rootDom.baseHref);
      this.setupIframe({
        rootId: this.rootDom.rootId,
        children: this.rootDom.children,
      });

      this.currentTimePosition = startTime || 0;

      this.queueChanges(this.domChanges, "updateDom", true);
      this.queueChanges(this.mouseClicks, "addMouseClick");
      this.queueChanges(this.scrollEvents, "updateScrollPosition", true);
      this.queueChanges(this.windowSizeChanges, "updateWindowSize", true);
      this.queueChanges(this.mouseMovements, "updateMouseMovements", true);
    },
    navigate(startTime) {
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
