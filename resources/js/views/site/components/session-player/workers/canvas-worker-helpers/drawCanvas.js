let ctx;
let canvas;
let isTransferable = false;
let offscreenCanvas;

export default function drawCanvas(data, callback) {
  if (data.msg === "init") {
    isTransferable = true;

    canvas = data.canvas;
    canvas.height = 20;
    ctx = canvas.getContext("2d");
    ctx.save();
  } else {
    let { canvasWidth } = data;
    if (!isTransferable) {
      // @ts-ignore
      offscreenCanvas = new OffscreenCanvas(canvasWidth, 20);
      ctx = offscreenCanvas.getContext("2d");
    } else {
      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.restore();

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
