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
      if (this.init === false && this.canvas) {
        this.init = true;
        sessionPlayerTicksWorker.postMessage(
          {
            msg: "init",
            canvas: this.canvas,
          },
          [this.canvas],
        );
      }
      sessionPlayerTicksWorker.postMessage({
        events: this.events,
        endingTime: this.endingTime,
        canvasWidth: this.canvasWidth,
        startingTime: this.startingTime,
      });
    },
  },
  render() {
    this.draw();
  },
};
</script>
