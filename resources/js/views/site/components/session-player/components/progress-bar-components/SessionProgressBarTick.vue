<script>
import CanvasHelpers from "./mixins/CanvasHelpers";
import SessionPlayerTicksWorker from "./../../workers/session-player-ticks.worker";
import CalculateCanvasPlayerPosition from "./mixins/CalculateCanvasPlayerPosition";

const sessionPlayerTicksWorker = new SessionPlayerTicksWorker();

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
          sessionPlayerTicksWorker.postMessage(
            {
              msg: "init",
              canvas: this.canvas,
            },
            [this.canvas],
          );
        } else {
          sessionPlayerTicksWorker.onmessage = ({ data }) => {
            console.info("Attach TICKS", data);
            this.canvas.transferFromImageBitmap(data.bitmap);
          };
        }
        sessionPlayerTicksWorker.postMessage({
          events: this.events,
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
