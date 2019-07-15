export default function calculatePosition(position, maxTiming, canvasWidth) {
  return (position / maxTiming) * canvasWidth;
}
