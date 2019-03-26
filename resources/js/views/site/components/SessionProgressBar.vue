<template>
  <div>
    <pre>{{ endingPosition }}</pre>
    <div @click="$emit('stop')" v-if="isPlaying">
      stop
    </div>
    <div @click="$emit('play', 0)" v-else>
      play
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
    playAtPosition(event) {
      let rect = event.target.getBoundingClientRect();
      let percentageFromLeftSide = (event.clientX - rect.left) / rect.right;
      this.$emit("navigate", percentageFromLeftSide * this.endingPosition);
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
</style>
