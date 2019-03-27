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
import ProgressBarEventMixin from "./mixins/ProgressBarEventMixin";
export default {
  mixins: [ProgressBarEventMixin],
};
</script>
