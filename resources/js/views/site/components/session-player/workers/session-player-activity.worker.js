import { playerEventTypes } from "@app/constants/playerEventTypes";
import playerTimingConverter from "@app/helpers/playerTimingConverter";

let timings = [];
let startingTime;
let skipThreshold;
let activityRanges = [];

let types = [
  playerEventTypes.Scroll,
  playerEventTypes.MouseClick,
  playerEventTypes.DomChange,
  playerEventTypes.MouseMovement,
  playerEventTypes.NetworkRequest,
];

function getActivityRanges() {
  let lastTiming = null;
  let startActivityTimingIndex;
  let startActivityTiming = null;

  for (let timingIndex in timings.sort()) {
    let timing = timings[timingIndex];

    if (startActivityTiming === null) {
      startActivityTiming = timing;
      startActivityTimingIndex = timingIndex;
      continue;
    }

    if (lastTiming === null || timing - lastTiming < skipThreshold) {
      lastTiming = timing;
      continue;
    }

    activityRanges.push({
      start: playerTimingConverter(startingTime, startActivityTiming),
      end: playerTimingConverter(startingTime, lastTiming),
    });

    lastTiming = null;
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
        timings = Object.values(
          Object.assign(timings, Object.keys(eventData.session[types[type]])),
        );
      }
      break;
  }

  postMessage(getActivityRanges());
};
