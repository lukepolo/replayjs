import drawCanvas from "./canvas-worker-helpers/drawCanvas";
import calculatePosition from "./canvas-worker-helpers/calculatePosition";

onmessage = ({ data }) => {
  drawCanvas(data, (ctx, callback) => {
    let { maxTiming } = data;

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

    callback();
  });
};
