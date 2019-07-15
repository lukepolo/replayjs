import drawCanvas from "./canvas-worker-helpers/drawCanvas";
import calculatePosition from "./canvas-worker-helpers/calculatePosition";

onmessage = ({ data }) => {
  drawCanvas(data, (ctx, callback) => {
    let { maxTiming, canvasWidth, activityRanges } = data;

    for (let index in activityRanges) {
      let activityRange = activityRanges[index];

      let start = calculatePosition(
        activityRange.start,
        maxTiming,
        canvasWidth,
      );
      let end = calculatePosition(
        activityRange.end || maxTiming,
        maxTiming,
        canvasWidth,
      );

      if (start) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(244,235,66,.8)";

        ctx.moveTo(start, 0);
        ctx.fillRect(start, 0, end - start, 100);
        ctx.stroke();
      }
    }
    callback();
  });
};
