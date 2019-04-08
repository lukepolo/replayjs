<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";

export default {
  mixins: [CanvasHelpers, CalculateCanvasPlayerPosition],
  props: {
    activity: {
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
      for (let index in this.activity) {
        let activity = this.activity[index];

        let start = this.calculatePosition(activity.start);
        let end = this.calculatePosition(activity.end);

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
