<script>
export default {
  inject: ["provider"],
  props: {
    events: {
      required: true,
    },
    startingPosition: {
      required: true,
    },
    endingPosition: {
      required: true,
    },
  },
  watch: {
    endingPosition: {
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

        const ctx = this.provider.context;

        ctx.beginPath();
        ctx.strokeStyle = event.color;
        ctx.moveTo(event.timing, 0);
        ctx.lineTo(event.timing, 20);

        ctx.stroke();
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
