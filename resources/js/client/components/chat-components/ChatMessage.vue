<template>
  <div>
    <pre>{{ message.user }}: {{ message.message }}</pre>
    <pre>{{ dateDisplay }}</pre>
  </div>
</template>

<script>
import { format } from "timeago.js";

const ONE_DAY = 24 * 60 * 1000;

export default {
  props: {
    message: {
      required: true,
    },
    currentTime: {
      required: true,
    },
  },
  computed: {
    dateDisplay() {
      let date = new Date(this.message.createdAt);

      if (this.currentTime - date < ONE_DAY) {
        {
          return format(date);
        }
      }

      return `${date.toLocaleTimeString(navigator.language, {
        hour: "numeric",
        minute: "2-digit",
      })} ${date.toLocaleDateString()}`;
    },
  },
};
</script>
