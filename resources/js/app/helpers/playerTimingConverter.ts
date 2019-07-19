export default function playerTimingConverter(
  startingTime,
  timing,
  floor = true,
) {
  let seconds = (parseInt(timing) - parseInt(startingTime)) / 1000;
  if (floor) {
    // return Math.floor(seconds);
  }
  return seconds;
}
