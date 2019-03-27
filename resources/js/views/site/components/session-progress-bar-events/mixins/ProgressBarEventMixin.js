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
