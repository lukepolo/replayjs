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
  computed: {
    maxTiming() {
      return playerTimingConverter(this.startingTime, this.endingTime, false);
    },
  },
};
