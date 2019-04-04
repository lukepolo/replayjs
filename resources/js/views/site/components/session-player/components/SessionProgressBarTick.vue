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
        this.draw(0);
      },
    },
  },
  methods: {
    draw(index) {
      let event = this.events[index];
      if (event) {
        let x = Math.floor(
          (parseInt(event.timing) - parseInt(this.startingPosition)) / 1000,
        );

        const ctx = this.provider.context;

        ctx.beginPath();
        ctx.strokeStyle = event.color;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 20);

        ctx.stroke();

        this.draw(index + 1);
      }
    },
  },
  render() {
    this.draw(0);
  },
};
</script>
