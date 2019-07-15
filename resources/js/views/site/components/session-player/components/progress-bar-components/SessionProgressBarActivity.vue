<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import SessionPlayerBarWorker from "./../../workers/session-player-bar.worker";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";

const sessionPlayerBarWorker = new SessionPlayerBarWorker();

export default {
  mixins: [CanvasHelpers, CalculateCanvasPlayerPosition],
  props: {
    activityRanges: {
      required: true,
    },
  },
  data() {
    return {
      init: false,
    };
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
      if (this.init === false && this.canvas) {
        this.init = true;
        sessionPlayerBarWorker.postMessage(
          {
            msg: "init",
            canvas: this.canvas,
          },
          [this.canvas],
        );
      }
      sessionPlayerBarWorker.postMessage({
        endingTime: this.endingTime,
        canvasWidth: this.canvasWidth,
        startingTime: this.startingTime,
        activityRanges: this.activityRanges,
      });
    },
  },
  render() {
    this.draw();
  },
};
</script>
