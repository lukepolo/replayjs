<template>
  <div>
    <div class="playAndPause">
      <input
        type="checkbox"
        id="playAndPause"
        name="playAndPause"
        :checked="!isPlaying"
        @click="playAndPause"
      />
      <label for="playAndPause"></label>
    </div>
    <pre>EVENTS : {{ events.length }}</pre>
    <pre>Current Time : {{ currentTimeDisplay }}</pre>
    <pre>End Time : {{ endingTimeDisplay }}</pre>
    <div class="progress" @click="playAtPosition">
      <div
        class="progress--bar"
        :style="{
          width: currentTimePercentage,
        }"
      ></div>
      <!--        TODO - need multiple canvas -->
      <!--        https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers-->
      <session-progress-bar-canvas
        :starting-time="startingTime"
        :ending-time="endingTime"
      >
        <session-progress-bar-activity
          :activity="activity"
          :starting-time="startingTime"
          :ending-time="endingTime"
        ></session-progress-bar-activity>
        <session-progress-bar-tick
          :events="events"
          :starting-time="startingTime"
          :ending-time="endingTime"
        ></session-progress-bar-tick>
      </session-progress-bar-canvas>
    </div>
  </div>
</template>

<script>
import SessionProgressBarTick from "./components/SessionProgressBarTick";
import SessionProgressBarCanvas from "./components/SessionProgressBarCanvas";
import SessionProgressBarActivity from "./components/SessionProgressBarActivity";

export default {
  inject: ["sessionPlayerEventsWorker", "sessionPlayerActivityWorker"],
  components: {
    SessionProgressBarActivity,
    SessionProgressBarTick,
    SessionProgressBarCanvas,
  },
  props: {
    currentTime: {
      required: true,
    },
    isPlaying: {
      required: true,
      type: Boolean,
    },
    startingTime: {
      required: true,
    },
    endingTime: {
      required: true,
    },
    session: {
      required: true,
    },
  },
  data() {
    return {
      events: [],
      activity: {},
    };
  },
  mounted() {
    this.sessionPlayerEventsWorker.onmessage = ({ data }) => {
      if (Array.isArray(data)) {
        return (this.events = data);
      }
      this.events.push(data);
    };

    this.sessionPlayerActivityWorker.onmessage = ({ data }) => {
      this.activity = data.activity;
    };
  },
  methods: {
    playAndPause() {
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
        this.startingTime + percentageFromLeftSide * this.endingTimeNormalized,
      );
    },
    _convertMsToTime(ms) {
      let seconds = ms / 1000;

      let hours = parseInt(seconds / 3600);
      seconds = seconds % 3600;

      let minutes = parseInt(seconds / 60);
      seconds = seconds % 60;

      let timeString = `${minutes.toString().lpad("0", 2)}:${parseInt(seconds)
        .toString()
        .lpad("0", 2)}`;
      if (hours > 0) {
        timeString = `${hours}:${timeString}`;
      }
      return timeString;
    },
  },
  computed: {
    endingTimeNormalized() {
      return this.endingTime - this.startingTime;
    },
    currentTimeNormalized() {
      return this.currentTime - this.startingTime;
    },
    endingTimeDisplay() {
      return this._convertMsToTime(this.endingTimeNormalized);
    },
    currentTimeDisplay() {
      return this._convertMsToTime(this.currentTimeNormalized);
    },
    currentTimePercentage() {
      return `${(this.currentTimeNormalized / this.endingTimeNormalized) *
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

$playAndPauseHeight: 10px;
$playAndPauseWidth: $playAndPauseHeight / 1.5;
.playAndPause {
  label {
    display: block;
    box-sizing: border-box;
    width: 0;
    height: $playAndPauseHeight + 2px;

    border-color: transparent transparent transparent #202020;
    transition: 100ms all ease;
    cursor: pointer;
    border-style: double;
    border-width: 0 0 0 $playAndPauseHeight;
  }
  input[type="checkbox"] {
    position: absolute;
    left: -9999px;
    &:checked + label {
      border-style: solid;
      border-width: $playAndPauseWidth 0 $playAndPauseWidth $playAndPauseHeight;
    }
  }
}
</style>
