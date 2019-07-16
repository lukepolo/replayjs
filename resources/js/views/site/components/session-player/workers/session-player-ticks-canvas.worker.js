import drawCanvas from "./canvas-worker-helpers/drawCanvas";
import calculatePosition from "./canvas-worker-helpers/calculatePosition";

onmessage = ({ data }) => {
  drawCanvas(data, (ctx, callback) => {
    let { color, events, maxTiming } = data;

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;

    for (let index in events) {
      let event = events[index];
      let x = calculatePosition(event, maxTiming, data.canvasWidth);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 20);
    }
    ctx.stroke();

    callback();
  });
};
