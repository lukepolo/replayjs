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
      if (this.canvas) {
        if (this.init === false && this.isTransferable) {
          this.init = true;
          sessionPlayerBarWorker.postMessage(
            {
              msg: "init",
              canvas: this.canvas,
            },
            [this.canvas],
          );
        } else {
          sessionPlayerBarWorker.onmessage = ({ data }) => {
            console.info("Attach Activity", data);
            this.canvas.transferFromImageBitmap(data.bitmap);
          };
        }

        sessionPlayerBarWorker.postMessage({
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
