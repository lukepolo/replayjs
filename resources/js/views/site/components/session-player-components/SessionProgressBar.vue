<template>
  <div>
    <div class="playpause">
      <input
        type="checkbox"
        id="playpause"
        name="playpause"
        :checked="!isPlaying"
        @click="playPause"
      />
      <label for="playpause"></label>
    </div>
    <div class="progress" @click="playAtPosition">
      <div
        class="progress--bar"
        :style="{
          width: currentPositionPercentage,
        }"
      ></div>
      <template v-for="event in events">
        <progress-bar-event
          :event="event"
          :starting-position="startingPosition"
          :ending-position="endingPosition"
        ></progress-bar-event>
      </template>
    </div>
  </div>
</template>

<script>
import ProgressBarEvent from "./components/ProgressBarEvent";
import SessionProgressBarWorker from "./workers/progress-bar.worker";
export default {
  beforeCreate() {
    this.worker = new SessionProgressBarWorker();
  },
  mounted() {
    this.worker.onmessage = ({ data }) => {
      this.$set(this, "events", data.events);
    };
  },
  components: {
    ProgressBarEvent,
  },
  props: {
    currentPosition: {
      required: true,
    },
    isPlaying: {
      required: true,
      type: Boolean,
    },
    startingPosition: {
      required: true,
    },
    endingPosition: {
      required: true,
    },
    session: {
      required: true,
    },
  },
  data() {
    return {
      events: [],
    };
  },
  watch: {
    session: {
      immediate: true,
      handler(session) {
        console.info("SEND TO WORKER");

        this.worker.postMessage({
          session,
        });

        // this.worker.onMessage((results) => {
        //   console.info(results);
        // })
      },
    },
  },
  methods: {
    playPause() {
      if (this.isPlaying) {
        return this.$emit("stop");
      }
      this.$emit("play");
    },
    playAtPosition(event) {
      let rect = event.target.getBoundingClientRect();
      let percentageFromLeftSide = (event.clientX - rect.left) / rect.right;
      this.$emit(
        "seek",
        this.startingPosition +
          percentageFromLeftSide *
            (this.endingPosition - this.startingPosition),
      );
    },
  },
  computed: {
    currentPositionPercentage() {
      return `${((this.currentPosition - this.startingPosition) /
        (this.endingPosition - this.startingPosition)) *
        100}%`;
    },
  },
};
</script>

<style lang="scss">
.progress {
  border: 1px solid #ccc;
  background-color: #fff;
  height: 20px;
  width: 80%;
  border-radius: 8px;
  display: flex;
  position: relative;

  &--bar {
    pointer-events: none;
    background-color: #48acf0;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    transition: all 100ms ease;
  }

  &--moment {
    pointer-events: none;
    border-right: 1px solid;
    position: absolute;
    top: -10px;
    bottom: 0px;
    cursor: pointer;
  }
}

$playPauseHeight: 10px;
$playPauseWidth: $playPauseHeight / 1.5;
.playpause {
  label {
    display: block;
    box-sizing: border-box;
    width: 0;
    height: $playPauseHeight + 2px;

    border-color: transparent transparent transparent #202020;
    transition: 100ms all ease;
    cursor: pointer;
    border-style: double;
    border-width: 0 0 0 $playPauseHeight;
  }
  input[type="checkbox"] {
    position: absolute;
    left: -9999px;
    &:checked + label {
      border-style: solid;
      border-width: $playPauseWidth 0 $playPauseWidth $playPauseHeight;
    }
  }
}
</style>
