<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";

export default {
  mixins: [CanvasHelpers, CalculateCanvasPlayerPosition],
  props: {
    events: {
      required: true,
    },
  },
  watch: {
    canvasWidth: {
      handler() {
        this.draw();
      },
    },
  },
  methods: {
    draw() {
      for (let index in this.events) {
        let event = this.events[index];

        let x = this.calculatePosition(event.timing);

        this.context.beginPath();
        this.context.strokeStyle = event.color;
        this.context.lineWidth = 1;
        this.context.moveTo(x, 0);
        this.context.lineTo(x, 20);
        this.context.stroke();
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
