import { playerEventTypes } from "@app/constants/playerEventTypes";
import playerTimingConverter from "@app/helpers/playerTimingConverter";

const types = {
  [playerEventTypes.DomChange]: {
    color: "orange",
  },
  [playerEventTypes.MouseClick]: {
    color: "orange",
  },
  [playerEventTypes.NetworkRequest]: {
    color: "green",
  },
  [playerEventTypes.ConsoleMessage]: {
    color: "red",
  },
  [playerEventTypes.TabVisibility]: {
    color: "black",
  },
};

let events = [];
let startingTime;

function mapData(type, timing) {
  return {
    type,
    color: types[type].color,
    timing: playerTimingConverter(startingTime, timing),
  };
}

onmessage = ({ data }) => {
  let eventData = data.data;

  switch (data.event) {
    case "addEvent":
      if (types[eventData.type]) {
        events.push(mapData(eventData.type, eventData.timing));
      }
      break;
    case "addEvents":
      startingTime = eventData.startingTime;
      Object.keys(types).forEach((type) => {
        for (let timing in eventData.session[type]) {
          events.push(mapData(type, timing));
        }
      });
      break;
  }
  postMessage(events);
};
