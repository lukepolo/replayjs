import playerTimingConverter from "@app/helpers/playerTimingConverter";

function calculatePosition(position, maxTiming, canvasWidth) {
  return (position / maxTiming) * canvasWidth;
}

function getMaxTiming(startingTime, endingTime) {
  return playerTimingConverter(startingTime, endingTime, false);
}

let ctx;
let canvas;
let isTransferable = false;
let offscreenCanvas;

onmessage = ({ data }) => {
  if (data.msg === "init") {
    canvas = data.canvas;
    canvas.height = 20;
    ctx = canvas.getContext("2d");
    ctx.save();
    isTransferable = true;
  } else {
    if (!isTransferable) {
      offscreenCanvas = new OffscreenCanvas(data.canvasWidth, 20);
      ctx = offscreenCanvas.getContext("2d");
    } else {
      canvas.width = data.canvasWidth;

      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.restore();

      ctx.width = data.canvasWidth;
    }

    let canvasWidth = data.canvasWidth;
    let activityRanges = data.activityRanges;
    let maxTiming = getMaxTiming(data.startingTime, data.endingTime);

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

    if (!isTransferable) {
      postMessage({ bitmap: offscreenCanvas.transferToImageBitmap() });
    }
  }
};
