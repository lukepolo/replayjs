import { playerEventTypes } from "@app/constants/playerEventTypes";
import playerTimingConverter from "@app/helpers/playerTimingConverter";

let timings = [];
let startingTime;
let types = [
  playerEventTypes.Scroll,
  playerEventTypes.MouseClick,
  playerEventTypes.DomChange,
  playerEventTypes.MouseMovement,
  playerEventTypes.NetworkRequest,
];

function getActivityRanges() {
  let activity = [];
  let lastTiming = null;
  let startActivityTiming = null;

  for (let timingIndex in timings) {
    let timing = timings[timingIndex];

    if (startActivityTiming === null) {
      startActivityTiming = timing;
      continue;
    }

    // TODO - this should match whatever is in the config?
    if (lastTiming === null || timing - lastTiming < 1000) {
      lastTiming = timing;
      continue;
    }

    activity.push({
      start: playerTimingConverter(startingTime, startActivityTiming),
      end: playerTimingConverter(startingTime, lastTiming),
    });

    lastTiming = null;
    startActivityTiming = null;
  }

  if (startActivityTiming && lastTiming) {
    activity.push({
      start: playerTimingConverter(startingTime, startActivityTiming),
      end: playerTimingConverter(startingTime, lastTiming),
    });
  }

  return activity;
}

onmessage = ({ data }) => {
  let eventData = data.data;
  switch (data.event) {
    case "addActivity":
      timings.push(eventData.timing);
      break;
    case "addAllActivity":
      startingTime = eventData.startingTime;

      for (let type in types) {
        timings = Object.values(
          Object.assign(timings, Object.keys(eventData.session[types[type]])),
        );
      }
      break;
  }

  postMessage({
    activity: getActivityRanges(timings.sort()),
  });
};
