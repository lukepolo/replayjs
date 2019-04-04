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
        let x = Math.floor(
          (parseInt(event.timing) - parseInt(this.startingPosition)) / 1000,
        );

        const ctx = this.provider.context;

        ctx.beginPath();
        ctx.strokeStyle = event.color;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 100);

        ctx.stroke();
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
