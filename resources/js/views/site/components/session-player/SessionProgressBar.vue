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
    <pre>EVENTS : {{ events.length }}</pre>
    <pre>Current Time : {{ currentTimeDisplay }}</pre>
    <pre>End Time : {{ endTimeDisplay }}</pre>
    <div class="progress" @click="playAtPosition">
      <div
        class="progress--bar"
        :style="{
          width: currentPositionPercentage,
        }"
      ></div>
      <template v-for="(event, index) in positionedEvents">
        <progress-bar-event :key="index" :event="event"></progress-bar-event>
      </template>
    </div>
  </div>
</template>

<script>
import ProgressBarEvent from "./components/ProgressBarEvent";
import SessionEventWorker from "./workers/session-event.worker";

const sessionEventWorker = new SessionEventWorker();

export default {
  inject: ["worker"],
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
      positionedEvents: [],
    };
  },
  mounted() {
    this.worker.onmessage = ({ data }) => {
      requestAnimationFrame(() => {
        this.events.push(data);
      });
    };

    this.requestAnimationInterval(() => {
      sessionEventWorker.postMessage({
        events: this.events,
        endingPosition: this.endingPosition,
        startingPosition: this.startingPosition,
      });
    }, 1000);

    sessionEventWorker.onmessage = ({ data }) => {
      requestAnimationFrame(() => {
        this.positionedEvents = data.events;
      });
    };
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
        this.startingPosition + percentageFromLeftSide * this.endTime,
      );
    },
    convertMsToTime(ms) {
      let seconds = ms / 1000;

      let hours = parseInt(seconds / 3600);
      seconds = seconds % 3600;

      let minutes = parseInt(seconds / 60);
      seconds = seconds % 60;

      let timeString = `${minutes}:${parseInt(seconds)
        .toString()
        .lpad("0", 2)}`;
      if (hours > 0) {
        timeString = `${hours}:${timeString}`;
      }
      return timeString;
    },
  },
  computed: {
    endTime() {
      return this.endingPosition - this.startingPosition;
    },
    currentTime() {
      return this.currentPosition - this.startingPosition;
    },
    endTimeDisplay() {
      return this.convertMsToTime(this.endTime);
    },
    currentTimeDisplay() {
      return this.convertMsToTime(this.currentTime);
    },
    currentPositionPercentage() {
      return `${(this.currentTime / this.endTime) * 100}%`;
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
