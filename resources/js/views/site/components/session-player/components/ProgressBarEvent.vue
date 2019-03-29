<template>
  <div>
    <div
      class="progress--moment"
      :style="{
        left: eventPosition,
        'border-right-color': event.color,
      }"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    event: {
      required: true,
    },
    startingPosition: {
      required: true,
    },
    endingPosition: {
      required: true,
    },
  },
  computed: {
    eventPosition() {
      return `${((this.event.timing - this.startingPosition) /
        (this.endingPosition - this.startingPosition)) *
        100}%`;
    },
  },
};
</script>
