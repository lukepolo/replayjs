<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";

export default {
  mixins: [CanvasHelpers, CalculateCanvasPlayerPosition],
  props: {
    activityRanges: {
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
      for (let index in this.activityRanges) {
        let activityRange = this.activityRanges[index];

        let start = this.calculatePosition(activityRange.start);
        let end = this.calculatePosition(activityRange.end || this.maxTiming);

        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.fillStyle = "rgba(244,235,66,.8)";
        this.context.moveTo(start, 0);
        this.context.fillRect(start, 0, end - start, 100);
        this.context.stroke();
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
