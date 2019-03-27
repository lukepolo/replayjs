<template>
  <div>
    <pre>{{ endingPosition }}</pre>
    '

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
      <!--    <div class="progress&#45;&#45;moment" style="left: 23%;"></div>-->
    </div>
  </div>
</template>

<script>
export default {
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
    border-right: 2px solid #777;
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
