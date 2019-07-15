export default function calculatePosition(position, maxTiming, canvasWidth) {
  return parseInt((position / maxTiming) * canvasWidth);
}
