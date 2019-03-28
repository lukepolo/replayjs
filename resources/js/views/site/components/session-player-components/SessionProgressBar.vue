<template>
  <div>
    <pre>{{ endingPosition }}</pre>
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
      <template v-for="timing in session.scroll_events">
        <template v-for="event in timing">
          <progress-bar-event
            color="blue"
            :event="event"
            :ending-position="endingPosition"
          ></progress-bar-event>
        </template>
      </template>
      <template v-for="timing in session.dom_changes">
        <template v-for="event in timing">
          <progress-bar-event
            color="gray"
            :event="event"
            :ending-position="endingPosition"
          ></progress-bar-event>
        </template>
      </template>
      <template v-for="timing in session.window_size_changes">
        <template v-for="event in timing">
          <progress-bar-event
            color="blue"
            :event="event"
            :ending-position="endingPosition"
          ></progress-bar-event>
        </template>
      </template>
      <template v-for="timing in session.network_requests">
        <template v-for="event in timing">
          <progress-bar-event
            color="purple"
            :event="event"
            :ending-position="endingPosition"
          ></progress-bar-event>
        </template>
      </template>
      <template v-for="timing in session.console_messages">
        <template v-for="event in timing">
          <progress-bar-event
            color="orange"
            :event="event"
            :ending-position="endingPosition"
          ></progress-bar-event>
        </template>
      </template>
      <template v-for="timing in session.mouse_clicks">
        <template v-for="event in timing">
          <progress-bar-event
            color="red"
            :event="event"
            :ending-position="endingPosition"
          ></progress-bar-event>
        </template>
      </template>
      <!--      <template v-for="timing in session.mouse_movements">-->
      <!--        <template v-for="event in timing">-->
      <!--          <progress-bar-event-->
      <!--            color="green"-->
      <!--            :event="event"-->
      <!--            :ending-position="endingPosition"-->
      <!--          ></progress-bar-event>-->
      <!--        </template>-->
      <!--      </template>-->
    </div>
  </div>
</template>

<script>
import ProgressBarEvent from "./session-progress-bar-components/ProgressBarEvent";

export default {
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
    endingPosition: {
      required: true,
    },
    session: {
      required: true,
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
      this.$emit("seek", percentageFromLeftSide * this.endingPosition);
    },
  },
  computed: {
    currentPositionPercentage() {
      return `${(this.currentPosition / this.endingPosition) * 100}%`;
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
