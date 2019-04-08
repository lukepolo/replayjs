import { playerEventTypes } from "@app/constants/playerEventTypes";
import playerTimingConverter from "@app/helpers/playerTimingConverter";

let types = [
  playerEventTypes.Scroll,
  playerEventTypes.MouseClick,
  playerEventTypes.DomChange,
  playerEventTypes.MouseMovement,
  playerEventTypes.NetworkRequest,
];

onmessage = ({ data }) => {
  let { session, startingTime } = data.data;

  let timings = {};
  for (let type in types) {
    timings = Object.values(
      Object.assign(timings, Object.keys(session[types[type]])),
    ).sort();
  }

  let activity = [];
  let lastTiming = null;
  let startActivityTiming = null;

  for (let timingIndex in timings) {
    let timing = timings[timingIndex];

    if (startActivityTiming === null) {
      startActivityTiming = timing;
      continue;
    }

    if (lastTiming === null || timing - lastTiming < 1500) {
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

  postMessage({
    activity,
  });
};
