<script>
import playerTimingConverter from "@app/helpers/playerTimingConverter";

export default {
  inject: ["provider"],
  props: {
    events: {
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
      for (let index in this.events) {
        let event = this.events[index];
        let x = event.timing;
        const ctx = this.provider.context;

        // TODO - this needs to be in the worker
        x =
          (x /
            playerTimingConverter(this.startingTime, this.endingTime, false)) *
          this.provider.canvas.width;

        ctx.beginPath();
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 1;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 20);
        ctx.stroke();
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
