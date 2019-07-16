let ctx;
let canvas;
let offscreenCanvas;
let isTransferable = false;

export default function drawCanvas(data, callback) {
  if (data.msg === "init") {
    isTransferable = true;

    canvas = data.canvas;
    canvas.height = 20;
    ctx = canvas.getContext("2d");
  } else {
    let { canvasWidth } = data;
    if (!isTransferable) {
      offscreenCanvas = new OffscreenCanvas(canvasWidth, 20);
      ctx = offscreenCanvas.getContext("2d");
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.width = canvasWidth;
      canvas.width = canvasWidth;
    }

    callback(ctx, () => {
      if (!isTransferable) {
        // TODO - define all target origins
        postMessage({ bitmap: offscreenCanvas.transferToImageBitmap() });
      }
    });
  }
}
