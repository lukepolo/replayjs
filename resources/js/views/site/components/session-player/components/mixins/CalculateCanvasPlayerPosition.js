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
      return (
        (position /
          playerTimingConverter(this.startingTime, this.endingTime, false)) *
        this.canvasWidth
      );
    },
  },
};