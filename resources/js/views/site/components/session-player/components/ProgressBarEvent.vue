<template>
  <div v-if="event.position">
    <div
      class="progress--moment"
      :style="{
        left: event.position,
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
  },
  data() {
    return {
      eventPosition: null,
    };
  },
};
</script>
