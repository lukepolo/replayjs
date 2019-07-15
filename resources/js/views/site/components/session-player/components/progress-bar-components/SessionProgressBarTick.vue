<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";
import SessionPlayerTicksCanvasWorker from "../../workers/session-player-ticks-canvas.worker";

const sessionPlayerTicksCanvasWorker = new SessionPlayerTicksCanvasWorker();

export default {
  mixins: [CanvasHelpers, CalculateCanvasPlayerPosition],
  props: {
    events: {
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
          sessionPlayerTicksCanvasWorker.postMessage(
            {
              msg: "init",
              canvas: this.canvas,
            },
            [this.canvas],
          );
        } else {
          sessionPlayerTicksCanvasWorker.onmessage = ({ data }) => {
            this.canvas.transferFromImageBitmap(data.bitmap);
          };
        }
        sessionPlayerTicksCanvasWorker.postMessage({
          events: this.events,
          maxTiming: this.maxTiming,
          endingTime: this.endingTime,
          canvasWidth: this.canvasWidth,
          startingTime: this.startingTime,
        });
      }
    },
  },
  render() {
    this.draw();
  },
};
</script>
