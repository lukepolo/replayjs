import { playerEventTypes } from "@app/constants/playerEventTypes";
import playerTimingConverter from "@app/helpers/playerTimingConverter";

let timings = [];
let startingTime;
let skipThreshold;
let activityRanges = [];

let types = [
  playerEventTypes.Scroll,
  playerEventTypes.MouseClick,
  playerEventTypes.MouseMovement,
];

function getActivityRanges() {
  let previousTiming = null;
  let startActivityTimingIndex;
  let startActivityTiming = null;

  for (let timingIndex in timings.sort(function(a, b) {
    return a - b;
  })) {
    let timing = parseFloat(timings[timingIndex]);

    if (startActivityTiming === null) {
      startActivityTiming = timing;
      startActivityTimingIndex = timingIndex;
      continue;
    }

    if (previousTiming === null || timing - previousTiming < skipThreshold) {
      previousTiming = timing;
      continue;
    }

    let start = playerTimingConverter(startingTime, startActivityTiming);
    let end = playerTimingConverter(startingTime, previousTiming);

    if (start === end) {
      end = end + skipThreshold / 1000;
    }

    activityRanges.push({
      start,
      end,
    });

    previousTiming = null;
    startActivityTiming = null;
    startActivityTimingIndex = null;
  }

  if (startActivityTimingIndex >= 0) {
    timings = timings.splice(startActivityTimingIndex);
    return activityRanges.concat([
      {
        start: startActivityTiming
          ? playerTimingConverter(startingTime, startActivityTiming)
          : null,
      },
    ]);
  }

  timings = [];
  return activityRanges;
}

onmessage = ({ data }) => {
  let eventData = data.data;
  switch (data.event) {
    case "addActivity":
      timings.push(eventData.timing);
      break;
    case "addAllActivity":
      startingTime = eventData.startingTime;
      skipThreshold = eventData.skipThreshold;

      for (let type in types) {
        timings = [
          ...new Set(
            timings.concat(Object.keys(eventData.session[types[type]])),
          ),
        ];
      }
      break;
  }
  postMessage(getActivityRanges());
};
