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
      this.setupMirror(this.rootDom.baseHref);
      this.setupIframe({
        rootId: this.rootDom.rootId,
        children: this.rootDom.children,
      });
      this.currentTimePosition = startTime || 0;
      for (let timing in this.domChanges) {
        if (timing <= this.currentTimePosition) {
          this.domChanges[timing].forEach((domChanges) => {
            if (!domChanges.rootId) {
              setTimeout(() => {
                this.updateDom(
                  domChanges.removed,
                  domChanges.addedOrMoved,
                  domChanges.attributes,
                  domChanges.text,
                );
              }, 0);
            } else {
              console.info("WE HAD A ROOT ELEMENT SOMEHOW");
            }
          });
        }
      }
      // TODO - window size / scroll position for initializing
      let { height, width } = this.session.window_size_changes[
        Object.keys(this.session.window_size_changes)[0]
      ];
      this.updateWindowSize(width, height);
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
      for (let timing in this.domChanges) {
        if (timing >= this.currentTimePosition) {
          this.domChanges[timing].forEach((domChanges) => {
            if (!domChanges.rootId) {
              this.timeoutUpdates.push(
                setTimeout(() => {
                  this.updateDom(
                    domChanges.removed,
                    domChanges.addedOrMoved,
                    domChanges.attributes,
                    domChanges.text,
                  );
                }, timing - this.currentTimePosition),
              );
            } else {
              console.info("WE HAD A ROOT ELEMENT SOMEHOW");
            }
          });
        }
      }
      this.timeInterval = setInterval(() => {
        this.currentTimePosition = this.currentTimePosition + 100;
      }, 100);

      // for (let timing in session.mouse_movements) {
      //   this.updateMouseMovements(session.mouse_movements[timing]);
      // }

      // for (let timing in session.mouse_clicks) {
      //   setTimeout(() => {
      //     let { x, y } = session.mouse_clicks[timing];
      //     this.addClick(x, y);
      //   }, session.mouse_clicks[timing].timing);
      // }
    },
    stop() {
      this.timeoutUpdates.forEach((update, index) => {
        clearTimeout(update);
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
