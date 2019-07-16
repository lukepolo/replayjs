<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";
import SessionPlayerTicksCanvasWorker from "../../workers/session-player-ticks-canvas.worker";

export default {
  mixins: [CanvasHelpers, CalculateCanvasPlayerPosition],
  props: {
    color: {
      required: true,
    },
    events: {
      required: true,
    },
  },
  data() {
    return {
      init: false,
      worker: null,
    };
  },
  watch: {
    canvasWidth: {
      handler() {
        this.draw();
      },
    },
  },
  created() {
    this.worker = new SessionPlayerTicksCanvasWorker();
  },
  methods: {
    draw() {
      if (this.canvas) {
        if (this.init === false && this.isTransferable) {
          this.init = true;
          this.worker.postMessage(
            {
              msg: "init",
              canvas: this.canvas,
            },
            [this.canvas],
          );
        } else {
          this.worker.onmessage = ({ data }) => {
            this.canvas.transferFromImageBitmap(data.bitmap);
          };
        }
        this.worker.postMessage({
          color: this.color,
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
