export default function playerTimingConverter(startingTime, timing) {
  return (parseInt(timing) - parseInt(startingTime)) / 1000;
}
