<template>
  <div>
    <div
      class="progress--moment"
      :style="{
        left: eventPosition,
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
    endingPosition: {
      required: true,
    },
  },
  created() {
    console.info();
  },
  computed: {
    eventPosition() {
      return `${(this.event.timing / this.endingPosition) * 100}%`;
    },
  },
};
</script>
