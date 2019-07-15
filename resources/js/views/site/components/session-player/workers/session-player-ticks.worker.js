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

    let maxTiming = getMaxTiming(data.startingTime, data.endingTime);

    for (let index in data.events) {
      let event = data.events[index];

      let x = calculatePosition(event.timing, maxTiming, data.canvasWidth);

      ctx.beginPath();
      ctx.strokeStyle = event.color;
      ctx.lineWidth = 1;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 20);
      ctx.stroke();
    }

    if (!isTransferable) {
      console.info("SEND TICKS");
      postMessage({ bitmap: offscreenCanvas.transferToImageBitmap() });
    }
  }
};
