<script>
import playerTimingConverter from "@app/helpers/playerTimingConverter";

export default {
  inject: ["provider"],
  props: {
    activity: {
      required: true,
    },
    startingTime: {
      required: true,
    },
    endingTime: {
      required: true,
    },
  },
  watch: {
    endingTime: {
      immediate: true,
      handler() {
        this.draw();
      },
    },
  },
  methods: {
    draw() {
      for (let index in this.activity) {
        let activity = this.activity[index];

        // TODO - this needs to be in the worker
        let start =
          (activity.start /
            playerTimingConverter(this.startingTime, this.endingTime, false)) *
          this.provider.canvas.width;
        let end =
          (activity.end /
            playerTimingConverter(this.startingTime, this.endingTime, false)) *
          this.provider.canvas.width;

        const ctx = this.provider.context;

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(244,235,66,.3)";
        ctx.moveTo(start, 0);

        ctx.fillRect(start, 0, end - start, 100);
        ctx.stroke();
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
