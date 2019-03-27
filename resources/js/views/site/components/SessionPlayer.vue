<template>
  <div>
    <div class="left-nav">
      <h1>Scale</h1>
      <pre>{{ scale }}</pre>
    </div>
    <div class="container">
      <div class="preview-box" ref="previewBox">
        <div class="overlay" ref="overlay">
          <div ref="clicks" id="clicks"></div>
          <div ref="cursor" id="cursor"></div>
        </div>
        <iframe
          ref="preview"
          id="preview"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
    <session-progress-bar
      v-if="session"
      @play="play"
      @stop="stop"
      @seek="seek"
      :is-playing="isPlaying"
      :current-position="currentTimePosition"
      :ending-position="endTiming"
    ></session-progress-bar>
  </div>
</template>

<script>
import MirrorMixin from "./mixins/MirrorMixin";
import PlayerMixin from "./mixins/PlayerMixin";
import SessionProgressBar from "./SessionProgressBar";
import MirrorEventsMixin from "./mixins/MirrorEventsMixin";
export default {
  mixins: [MirrorMixin, PlayerMixin, MirrorEventsMixin],
  components: {
    SessionProgressBar,
  },
  props: {
    session: {
      required: true,
    },
  },
  mounted() {
    this.previewFrame = document.getElementById("preview");
    this.previewDocument = this.previewFrame.contentWindow.document;
  },
  watch: {
    session: {
      immediate: true,
      handler(session) {
        if (session) {
          this.initializePlayer();
        }
      },
    },
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}

.overlay {
  z-index: 1;
  position: absolute;
}

.overlay,
#preview {
  transform-origin: 0 0;
}

.container {
}

.left-nav {
  display: flex;
  flex: 0 0 150px;
}

.preview-box {
  overflow: hidden;
  max-height: 100%;
  flex: 1 1 auto;
}

.sessions {
  height: 100px;
  overflow: hidden;
}

@-webkit-keyframes load-progress {
  100% {
    opacity: 0;
    margin-top: -40px;
    margin-left: -40px;
    border-width: 40px;
  }
}

@keyframes load-progress {
  100% {
    opacity: 0;
    margin-top: -40px;
    margin-left: -40px;
    border-width: 40px;
  }
}

#clicks div {
  width: 0;
  height: 0;
  opacity: 0.6;
  position: fixed;
  border-radius: 50%;
  border: 1px solid #6c7a89;
  background-color: #6c7a89;
  animation: load-progress 1s;
}

#cursor {
  top: 1px;
  z-index: 999999999999999999;
  width: 25px;
  height: 25px;
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("./../../../../images/cursor.png");
}
</style>
