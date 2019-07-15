<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";
import SessionPlayerActivityCanvasWorker from "../../workers/session-player-activity-canvas.worker";

const sessionPlayerActivityCanvasWorker = new SessionPlayerActivityCanvasWorker();

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
      if (this.canvas) {
        if (this.init === false && this.isTransferable) {
          this.init = true;
          sessionPlayerActivityCanvasWorker.postMessage(
            {
              msg: "init",
              canvas: this.canvas,
            },
            [this.canvas],
          );
        } else {
          sessionPlayerActivityCanvasWorker.onmessage = ({ data }) => {
            this.canvas.transferFromImageBitmap(data.bitmap);
          };
        }

        sessionPlayerActivityCanvasWorker.postMessage({
          maxTiming: this.maxTiming,
          endingTime: this.endingTime,
          canvasWidth: this.canvasWidth,
          startingTime: this.startingTime,
          activityRanges: this.activityRanges,
        });
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
