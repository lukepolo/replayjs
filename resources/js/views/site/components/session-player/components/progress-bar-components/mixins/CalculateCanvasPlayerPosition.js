import playerTimingConverter from "@app/helpers/playerTimingConverter";

export default {
  props: {
    startingTime: {
      required: true,
    },
    endingTime: {
      required: true,
    },
  },
  methods: {
    calculatePosition(position) {
      return (position / this.maxTiming) * this.canvasWidth;
    },
  },
  computed: {
    maxTiming() {
      return playerTimingConverter(this.startingTime, this.endingTime, false);
    },
  },
};
